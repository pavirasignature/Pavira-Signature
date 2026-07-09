using System.Collections.Generic;
using UnityEngine;

[RequireComponent(typeof(Collider))]
public class AntigravityZone : MonoBehaviour
{
    [Header("Antigravity Settings")]
    [Tooltip("The upward acceleration force applied to objects inside the zone (replaces normal gravity).")]
    [SerializeField] private float antigravityStrength = 12f;

    [Tooltip("The maximum upward velocity an object can reach inside the zone to prevent infinite acceleration.")]
    [SerializeField] private float maxUpwardVelocity = 15f;

    [Tooltip("Smoothly dampens the transition when entering the zone to reduce jitter.")]
    [SerializeField] private float entryDamping = 0.5f;

    [Header("Player Settings")]
    [Tooltip("If checked, objects exiting this zone will not take fall damage on their next landing.")]
    [SerializeField] private bool disableNextFallDamage = true;

    // Track active rigidbodies and their original gravity settings
    private readonly Dictionary<Rigidbody, RigidbodyState> activeObjects = new Dictionary<Rigidbody, RigidbodyState>();

    private struct RigidbodyState
    {
        public bool useGravity;
        public float originalDrag;
    }

    private void Awake()
    {
        // Ensure the attached collider is set as a trigger
        Collider col = GetComponent<Collider>();
        if (col != null)
        {
            col.isTrigger = true;
        }
    }

    private void OnTriggerEnter(Collider other)
    {
        Rigidbody rb = other.attachedRigidbody;
        if (rb != null && !activeObjects.ContainsKey(rb))
        {
            // Store original states
            RigidbodyState originalState = new RigidbodyState
            {
                useGravity = rb.useGravity,
                originalDrag = rb.drag
            };
            activeObjects.Add(rb, originalState);

            // Disable standard gravity inside the zone
            rb.useGravity = false;

            // Apply a minor counter-velocity dampening on entry to neutralize downward momentum smoothly
            Vector3 enteringVelocity = rb.linearVelocity; // Use rb.velocity in Unity 2022 and below
            if (enteringVelocity.y < 0)
            {
                rb.linearVelocity = new Vector3(enteringVelocity.x, enteringVelocity.y * entryDamping, enteringVelocity.z);
            }

            // Handle Fall Damage prevention system if applicable
            if (disableNextFallDamage)
            {
                IFallDamageReceiver fallDamageComponent = other.GetComponent<IFallDamageReceiver>();
                fallDamageComponent?.SetFallDamageDisabled(true);
            }
        }
    }

    private void FixedUpdate()
    {
        // Clean up destroyed Rigidbodies from dictionary
        List<Rigidbody> keysToRemove = new List<Rigidbody>();

        foreach (var kvp in activeObjects)
        {
            Rigidbody rb = kvp.Key;

            if (rb == null)
            {
                keysToRemove.Add(rb);
                continue;
            }

            // Calculate current upward velocity
            float currentYVelocity = rb.linearVelocity.y; // Use rb.velocity in Unity 2022 and below

            // Apply upward force only if we haven't exceeded the velocity cap
            if (currentYVelocity < maxUpwardVelocity)
            {
                // Force = mass * acceleration. Applying Acceleration type ignores mass differences.
                rb.AddForce(Vector3.up * antigravityStrength, ForceMode.Acceleration);
            }
            else
            {
                // Cap the velocity precisely to prevent infinite space acceleration
                rb.linearVelocity = new Vector3(rb.linearVelocity.x, maxUpwardVelocity, rb.linearVelocity.z);
            }
        }

        foreach (Rigidbody rb in keysToRemove)
        {
            activeObjects.Remove(rb);
        }
    }

    private void OnTriggerExit(Collider other)
    {
        Rigidbody rb = other.attachedRigidbody;
        if (rb != null && activeObjects.TryGetValue(rb, out RigidbodyState originalState))
        {
            // Restore original physics configuration
            rb.useGravity = originalState.useGravity;
            rb.drag = originalState.originalDrag;

            activeObjects.Remove(rb);

            // Notify player controllers that fall damage exemption is active until they touch the ground
            if (disableNextFallDamage)
            {
                IFallDamageReceiver fallDamageComponent = other.GetComponent<IFallDamageReceiver>();
                // Only keep disabled until they land on the ground
                fallDamageComponent?.EnableFallDamageExemptionUntilLanding();
            }
        }
    }
}

/// <summary>
/// Place this interface on your Player Controller to integrate the Fall Damage toggle.
/// </summary>
public interface IFallDamageReceiver
{
    void SetFallDamageDisabled(bool isDisabled);
    void EnableFallDamageExemptionUntilLanding();
}

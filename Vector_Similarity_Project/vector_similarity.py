import torch
import torch.nn.functional as F
import math

def check_relationship(a: list, b: list):
    vec_a = torch.tensor(a, dtype=torch.float32)
    vec_b = torch.tensor(b, dtype=torch.float32)

    dot = torch.dot(vec_a, vec_b).item()

    cos_sim = F.cosine_similarity(vec_a.unsqueeze(0), vec_b.unsqueeze(0)).item()

    angle_rad = math.acos(max(-1.0, min(1.0, cos_sim)))
    angle_deg = math.degrees(angle_rad)

    if cos_sim > 0.9:
        verdict = "Very Similar (almost same direction)"
    elif cos_sim > 0.5:
        verdict = "Somewhat Related (pointing similarly)"
    elif cos_sim > -0.1:
        verdict = "Weakly Related or Perpendicular"
    elif cos_sim > -0.5:
        verdict = "Somewhat Opposite"
    else:
        verdict = "Very Opposite (nearly reversed)"

    print(f"  Vector A      : {a}")
    print(f"  Vector B      : {b}")
    print(f"  Dot Product   : {dot:.4f}")
    print(f"  Cosine Sim    : {cos_sim:.4f}")
    print(f"  Angle         : {angle_deg:.2f}°")
    print(f"  Relationship  : {verdict}")


check_relationship([-2, -2], [-2, -2])
print("------------------------------ \n")
check_relationship([1, 10], [10, 1])
print("------------------------------ \n")
check_relationship([1, 1], [0, 1])
print("------------------------------")
check_relationship([1, 0], [-1, 0])
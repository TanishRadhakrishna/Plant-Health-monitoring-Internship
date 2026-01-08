import cv2
import numpy as np

def extract_features(img):
    """
    img: normalized image (0–1), shape (H, W, 3)
    returns: feature vector
    """

    img_uint8 = (img * 255).astype(np.uint8)
    b, g, r = cv2.split(img_uint8)

    eps = 1e-6

    # 1. Chlorophyll proxy
    chlorophyll_index = np.mean(g / (r + b + eps))

    # 2. Yellowing ratio (nutrient deficiency)
    yellow_ratio = np.mean(r / np.clip(g, 1, 255))

    # 3. Brown / necrotic area ratio
    brown_mask = (r > g) & (r > b) & (r > 80)
    brown_ratio = np.sum(brown_mask) / brown_mask.size

    # 4. Texture – edge density
    gray = cv2.cvtColor(img_uint8, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 80, 160)
    edge_density = np.sum(edges > 0) / edges.size

    # 5. Shape damage (normalized leaf area)
    _, thresh = cv2.threshold(gray, 120, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    if contours:
        leaf_area = max(cv2.contourArea(c) for c in contours)
    else:
        leaf_area = 0

    img_area = img_uint8.shape[0] * img_uint8.shape[1]
    leaf_area_ratio = leaf_area / img_area

    return [
        chlorophyll_index,
        yellow_ratio,
        brown_ratio,
        edge_density,
        leaf_area_ratio
    ]

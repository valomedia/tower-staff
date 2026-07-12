//
//  RotationAngle.ts
//  tower-staff
//
//  Copyright © 2025 valo.media GmbH. All rights reserved.
//

/**
 * Numbers that make sense as a rotation angle for correcting video orientation.
 */
export type RotationAngle = 0|90|180|270;

/**
 * The number of degrees to rotate with each rotation.
 */
export const ROTATION_STEP = 90;

/**
 * The number of degrees in a full circle.
 */
export const FULL_ROTATION = 360;

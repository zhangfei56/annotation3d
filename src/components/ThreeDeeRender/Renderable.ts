// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import * as THREE from "three";


export const SELECTED_ID_VARIABLE = "selected_id";

export type BaseUserData = {
  /** Timestamp when the associated `MessageEvent` was received */
  receiveTime: bigint;
  /** Timestamp extracted from a field in the associated message, such as `header.stamp` */
  messageTime: bigint;
  /** Coordinate frame this Renderable exists in */
  frameId: string;
  /** Local position and orientation of the Renderable */
  /** Settings tree path where errors will be displayed */
  settingsPath: ReadonlyArray<string>;
  /** User-customizable settings for this Renderable */
  /** Topic that the Renderable belongs to, if applicable*/
  topic?: string;
};

/**
 * Renderables are generic THREE.js scene graph entities with additional
 * properties from `BaseUserData` that allow coordinate frame transforms to
 * automatically be applied and settings tree errors to be displayed.
 */
export class Renderable<TUserData extends BaseUserData = BaseUserData> extends THREE.Object3D {
  /** Identifies this class as inheriting from `Renderable` */
  public readonly isRenderable = true;
  /** Allow this Renderable to be selected during picking and shown in the Object Details view */
  public readonly pickable: boolean = true;
  /**
   * Use a second picking pass for this Renderable to select a single numeric instanceId. This
   * instanceId can be passed to `instanceDetails()` to get more information about the instance.
   */
  public readonly pickableInstances: boolean = false;
  /** A reference to the parent `Renderer` that owns the scene graph containing this object */
  /** Additional data associated with this entity */
  public override userData: TUserData;

  public constructor(name: string, userData: TUserData) {
    super();
    this.name = name;
    this.userData = userData;
  }

  /**
   * Dispose of any unmanaged resources uniquely associated with this Renderable
   * such as GPU buffers.
   */
  public dispose(): void {
    this.children.length = 0;
  }


}

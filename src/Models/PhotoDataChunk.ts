/*
 * Copyright (c) 2024-2026 valo.media GmbH
 * All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * The data sent in a photoDataEvent.
 */
export default interface PhotoDataChunk {

    /**
     * The base-64 encoded string of one chunk of image data.
     */
    imageData: string;

    /**
     * The information needed to reassemble the chunks into a complete image.
     *
     * @property index The index of this chunk in the set it belongs to.
     * @property count The total number of chunks in the set this chunk belongs to.
     * @property uuid A uuid that is the same for all the chunks belonging to the same photo.
     */
    chunkingInfo: {
        index: number,
        count: number,
        uuid: string
    };

}

//
//  UploadLink.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2025-05-05.
//  Copyright © 2025 valo.media GmbH. All rights reserved.
//

/**
 * A url that can be used to upload a file under a particular key, along with its expiry info.
 */
export default interface UploadLink {

    /**
     * The url the file can be uploaded to using a PUT request.
     */
    uploadUrl: URL;

    /**
     * The key that can be used to retrieve the file later.
     */
    key: string;

    /**
     * The Date until which the upload url can be used.
     */
    expiresOn: Date;

}

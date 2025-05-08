//
//  DownloadLink.ts
//  tower-staff
//
//  Created by Jean-Pierre Höhmann on 2025-05-05.
//  Copyright © 2025 valo.media GmbH. All rights reserved.
//

/**
 * A url that can be used to download a file, along with its expiry info.
 */
export default interface DownloadLink {

    /**
     * The url the file can be downloaded from using a GET request.
     */
    downloadUrl: URL;

    /**
     * The Date until which the download url can be used.
     */
    expiresOn: Date;

}

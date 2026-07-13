//
//  ProfileComponent.tsx
//  tower-staff
//
//  Copyright © 2025 valo.media GmbH. All rights reserved.
//

import './ProfileComponent.scss';
import { UserData } from '../Models/UserData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAt,
    faCakeCandles,
    faCircleUser,
    faMars,
    faPhone,
    faTransgender,
    faVenus
} from '@fortawesome/free-solid-svg-icons';
import { faAndroid, faApple } from '@fortawesome/free-brands-svg-icons';
import { Gender } from '../Models/Gender';


/**
 * The profile with information about the user and the app they are using.
 *
 * @param clientInfo    Information about the app the user is using to connect.
 * @param userProfile   Information about the user making the call.
 */
export default function ProfileComponent({userData: {clientInfo, userProfile}}: {userData: UserData}) {

    return (
        <div className='profile'>
            <div className='profile-name'>
                <FontAwesomeIcon icon={faCircleUser}/>
                <p>
                    <strong>{userProfile.firstName || ""}</strong>
                    <br/>
                    {userProfile.lastName || ""}
                </p>
            </div>
            {
                clientInfo.identifier === "media.valo.Tower-iOS"
                    ? <p><FontAwesomeIcon icon={faApple}/>&nbsp;TOWER&nbsp;iOS&nbsp;{clientInfo.version}</p>
                    : <p><FontAwesomeIcon icon={faAndroid}/>&nbsp;TOWER&nbsp;Android&nbsp;{clientInfo.version}</p>
            }
            {
                userProfile.gender === Gender.OTHER ? <p><FontAwesomeIcon icon={faTransgender}/>&nbsp;Divers</p>
                    : userProfile.gender === Gender.FEMALE ? <p><FontAwesomeIcon icon={faVenus}/>&nbsp;Weiblich</p>
                        :userProfile.gender === Gender.MALE ? <p><FontAwesomeIcon icon={faMars}/>&nbsp;Männlich</p>
                            : <></>
            }
            {userProfile.birthdate &&
                <p>
                    <FontAwesomeIcon icon={faCakeCandles}/>
                    &nbsp;
                    {userProfile.birthdate.split("-").reverse().join(".")}
                </p>
            }
            {userProfile.phone &&
                <p>
                    <FontAwesomeIcon icon={faPhone}/>
                    &nbsp;
                    {userProfile.phone}
                </p>
            }
            {userProfile.email &&
                <p>
                    <FontAwesomeIcon icon={faAt}/>
                    &nbsp;
                    {userProfile.email}
                </p>
            }
        </div>
    );

}

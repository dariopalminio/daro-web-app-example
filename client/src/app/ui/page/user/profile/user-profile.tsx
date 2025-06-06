
import { FunctionComponent, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SessionContext, {
    ISessionContext,
} from "domain/context/session.context";
import { Profile } from "domain/model/user/profile.type";
import { Address } from "domain/model/user/address.type";
import CircularProgress from "app/ui/common/progress/circular-progress";
import Alert from "app/ui/common/alert/alert";
import useProfile from "domain/hook/profile/profile.hook";
import ProfileForm from "app/ui/component/user/profile/profile-form";


const initialNewAddress: Address = {
    street: '',
    department: '',
    neighborhood: '',
    city: '',
    state: '',
    country: ''
};

const initialEmptyProfile: Profile = {
    userId: '',
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    docType: '',
    document: '',
    telephone: '',
    language: '',
    addresses: [initialNewAddress]
};

/**
 * User Profile
 * 
 * Pattern: Container Component (Stateful/Container/Smart component), Conditional Rendering and Custom hook
 */
const UserProfile: FunctionComponent = () => {
    const { t, i18n } = useTranslation();
    const { session } = useContext(SessionContext) as ISessionContext;
    const [profile, setProfile] = useState(initialEmptyProfile);
    const [initialized, setInitialized] = useState(false);
    const { isProcessing, hasError, msg, isSuccess, getProfile, updateProfile } = useProfile();


    const fetchData = async () => {
        const username = session ? session.preferred_username : '';

        try {
            const info = await getProfile(username);

            if (info.language) i18n.changeLanguage(info.language.toLowerCase());


            console.log('****************UserProfile PAGE fetchData.info.userName', info);

            if (info.userName) {
                setProfile({
                    ...profile,
                    userName: info.userName,
                    firstName: info.firstName,
                    lastName: info.lastName,
                    email: info.email,
                    docType: info.docType ? info.docType.toUpperCase() : '',
                    document: info.document,
                    telephone: info.telephone,
                    language: info.language ? info.language.toLowerCase() : '',
                    addresses: info.addresses
                });

            }

        } catch (e) {
            console.log(e);
        }

        setInitialized(true);
    };

    useEffect(() => {

        fetchData();

    }, []);

    const handleUpdateSubmit = async () => {

        try {
            await updateProfile(profile);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div>
            {(!hasError) && <div >

                <ProfileForm initialized={initialized} profile={profile}
                    onChange={(profile: any) => setProfile(profile)}
                    onSubmit={() => handleUpdateSubmit()} />

            </div>
            }
            <br />

            {isProcessing && (
                <div className="box">
                    <strong>{t('login.info.loading')}</strong>
                    <CircularProgress />
                </div>
            )}

            {hasError && <Alert severity="error">{t(msg)}</Alert>}

            {isSuccess && <Alert severity="success">{t(msg)}</Alert>}
        </div>
    );
};

export default UserProfile;
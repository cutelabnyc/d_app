import React, { useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSISTENCE_KEY = 'PROFILE_KEY';
export const ProfileContext = React.createContext(null);

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

export const ProfileProvider = ({children}) => {

    const [profile, updateLocalProfile] = React.useState({
        minValue: 18,
        maxValue: 100,
        gender: "f"
    });

    const persistData = async (newData) => {
        await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(newData));
    };

    const restoreData = async () => {
        const rawData = await AsyncStorage.getItem(PERSISTENCE_KEY);
        if (rawData) {
            const data = JSON.parse(rawData);
            updateLocalProfile(data);
        }
    };

    const setProfile = debounce(async (newProfile) => {
        persistData(newProfile);
        updateLocalProfile(newProfile);
    }, 3000);

    useEffect(() => {
        restoreData();
    }, []);

    return (
        <ProfileContext.Provider value={{
            profile,
            setProfile
        }}>
            {children}
        </ProfileContext.Provider>
    );
}
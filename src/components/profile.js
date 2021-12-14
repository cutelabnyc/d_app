import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, View, Text, StatusBar, Button, FlatList } from 'react-native';
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { ProfileContext } from "../contexts/ProfileContext";

const GenderListRow = ({ title, selected, handlePress }) => {
    const color = selected ? '#2222cc' : '#333'
    return (
        <View style={styles.item}>
            <Button style={styles.item} onPress={() => {if (!!handlePress) handlePress()}} title={title} color={color}/>
        </View>
    );
}

function Profile() {

    const { profile, setProfile } = useContext(ProfileContext);

    const minValue = profile ? profile.minValue : 18;
    const maxValue = profile ? profile.maxValue : 100;
    const gender = profile ? profile.gender : "f";

    // const renderItem = ({ item }) => {
    //     return (
    //         <GenderListRow title={item.title} selected={item.id === gender} handlePress={() => 
    //             {
    //                 if (!!profile) {
    //                     setProfile(Object.assign({}, profile, { gender: item.id }));
    //                 }
    //             }}
    //         />
    //     );
    // };

    // const GENDER_DATA = [
    //     {
    //         id: "m",
    //         title: "Male"
    //     },
    //     {
    //         id: "f",
    //         title: "Female"
    //     }
    // ];

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            
            <Text>Hi I'm your profile!</Text>

            <Text>Preferred Age</Text>
            <MultiSlider
                values={[minValue, maxValue]}
                onValuesChange={(values) => {
                    if (!profile) return;
                    const newProfile = Object.assign({}, profile, {
                        minValue: values[0],
                        maxValue: values[1],
                    });
                    setProfile(newProfile);
                }}
                min={18}
                max={100}
            />
            <View>
                <Text>{minValue} - {maxValue}</Text>
            </View>

            <Text>Preferred Gender</Text>
            {/* <FlatList
                data={GENDER_DATA}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            /> */}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
    },
    item: {
        padding: 2,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    selected: {
        backgroundColor: '#f9c2ff'
    },
    title: {
        fontSize: 32,
    },
});

export default Profile;

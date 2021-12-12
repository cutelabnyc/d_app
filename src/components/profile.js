import React, { useEffect } from "react";
import { StyleSheet, View, Text, StatusBar, Button, FlatList } from 'react-native';
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import AsyncStorage from '@react-native-community/async-storage';

const PERSISTENCE_KEY = 'PROFILE_KEY';

const GENDER_DATA = [
    {
        id: "m",
        title: "Male"
    },
    {
        id: "f",
        title: "Female"
    }
];

const GenderListRow = ({ title, selected, handlePress }) => {
    const color = selected ? '#2222cc' : '#333'
    return (
        <View style={styles.item}>
            <Button style={styles.item} onPress={() => {if (!!handlePress) handlePress()}} title={title} color={color}/>
        </View>
    );
}

function Profile() {

    const [minValue, setMinValue] = React.useState(20);
    const [maxValue, setMaxValue] = React.useState(30);
    const [gender, setGender] = React.useState('f');
    const [isReady, setIsReady] = React.useState(false);

    const persistData = async () => {
        const data = { minValue, maxValue, gender };
        await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(data));
    };

    const restoreData = async () => {
        const rawData = await AsyncStorage.getItem(PERSISTENCE_KEY);
        const data = JSON.parse(rawData);
        setMinValue(data.minValue);
        setMaxValue(data.maxValue);
        setGender(data.gender);

        setIsReady(true);
    };

    useEffect(() => {
        if (isReady) persistData();
    }, [minValue, maxValue, gender, isReady]);

    useEffect(() => {
        restoreData();
    }, [])

    const renderItem = ({ item }) => {
        return (<GenderListRow title={item.title} selected={item.id === gender} handlePress={() => setGender(item.id)}/>);
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            
            <Text>Hi I'm your profile!</Text>

            <Text>Preferred Age</Text>
            <MultiSlider
                values={[minValue, maxValue]}
                onValuesChange={(values) => {
                    setMinValue(values[0]);
                    setMaxValue(values[1]);
                }}
                min={18}
                max={100}
            />
            <View>
                <Text>{minValue} - {maxValue}</Text>
            </View>

            <Text>Preferred Gender</Text>
            <FlatList
                data={GENDER_DATA}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />

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

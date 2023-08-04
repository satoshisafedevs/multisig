import React, { useState, useEffect } from "react";
import { Box, Circle, Divider, Flex, Heading, Text, Button, Image, Input } from "@chakra-ui/react";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { useUser } from "../../providers/User";
import useAuth from "../../hooks/useAuth";

function Profile() {
    const [isEditing, setIsEditing] = useState({ displayName: false, email: false, walletAddress: false });
    const [displayName, setName] = useState("John Doe");
    const [email, setEmail] = useState("johndoe@example.com");
    const [image, setImage] = useState(
        "https://firebasestorage.googleapis.com/v0/b/prontoai-playground.appspot.com/o" +
            "/profile-images%2FpcNS2Dk4WZfjC2MnN4lwRTGgGCt1?alt=media&token=a4caaa56-10ac-4e4c-a163-4ab773a8764c",
    );
    const [walletAddress, setWalletAddress] = useState(null);
    const { firestoreUser, userTeamData, setUserTeamWallet } = useUser();
    const { updateUserData } = useAuth();

    // Load user profile information from Firebase
    useEffect(() => {
        setImage(firestoreUser.photoURL);
        setName(firestoreUser.displayName);
        setEmail(firestoreUser.email);
        setWalletAddress(userTeamData.userWalletAddress);
        // Load other fields if available
    }, []);
    const toggleEditing = (field) => {
        setIsEditing({ ...isEditing, [field]: !isEditing[field] });
    };

    const saveProfile = async (field) => {
        if (isEditing.displayName || isEditing.email) {
            updateUserData(firestoreUser, { [field]: field === "displayName" ? displayName : email });
        }
        if (isEditing.walletAddress) {
            setUserTeamWallet(walletAddress);
        }
        toggleEditing(field);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = async () => {
            // Get the data URL of the uploaded file
            const dataURL = reader.result;

            // Get a reference to Firebase Storage
            const storage = getStorage();

            const imageRef = ref(storage, `profile-images/${firestoreUser.uid}`);

            // Upload the data URL to Firebase Storage
            const uploadTaskSnapshot = await uploadString(imageRef, dataURL, "data_url");

            // Get the download URL of the uploaded image
            const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);

            // Update the image state
            setImage(downloadURL);
            updateUserData(firestoreUser, { photoURL: downloadURL });
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    return (
        <Box padding="10px" backgroundColor="white" minWidth="500px" margin="10px">
            <Flex justifyContent="space-between" alignItems="center">
                <Box>
                    <Heading as="h2">Profile</Heading>
                    <Text>Change your profile information such as name, profile picture, and wallet address</Text>
                </Box>
                <Box>
                    <label htmlFor="image-upload">
                        <input
                            type="file"
                            hidden
                            id="image-upload"
                            onChange={handleImageChange}
                            aria-label="Profile Picture Upload"
                        />
                        <Circle size="100px" cursor="pointer">
                            <Image src={image} alt="Profile" objectFit="cover" borderRadius="50%" />
                        </Circle>
                    </label>
                </Box>
            </Flex>
            <Divider my={4} />
            <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Name</Text>
                {isEditing.displayName ? (
                    <Input w="70%" value={displayName} onChange={(e) => setName(e.target.value)} />
                ) : (
                    <Text textAlign="center" flex="1">
                        {displayName}
                    </Text>
                )}
                <Button onClick={() => saveProfile("displayName")}>{isEditing.displayName ? "Save" : "Edit"}</Button>
            </Flex>
            <Divider my={4} />
            <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Email</Text>
                {isEditing.email ? (
                    <Input w="70%" value={email} onChange={(e) => setEmail(e.target.value)} />
                ) : (
                    <Text textAlign="center" flex="1">
                        {email}
                    </Text>
                )}
                <Button onClick={() => saveProfile("email")}>{isEditing.email ? "Save" : "Edit"}</Button>
            </Flex>
            <Divider my={4} />
            <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Wallet Address</Text>
                {isEditing.walletAddress ? (
                    <Input w="70%" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
                ) : (
                    <Text textAlign="center" flex="1">
                        {walletAddress}
                    </Text>
                )}
                <Button onClick={() => saveProfile("walletAddress")}>
                    {isEditing.walletAddress ? "Save" : "Edit"}
                </Button>
            </Flex>
        </Box>
    );
}

export default Profile;
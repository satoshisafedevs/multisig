import { Box, Button, Circle, Divider, Flex, Heading, Image, Input, Text, useColorModeValue } from "@chakra-ui/react";
import { ethers } from "ethers";
import { getDownloadURL, getStorage, ref, uploadString } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { IoImageOutline } from "react-icons/io5";
import useAuth from "../../hooks/useAuth";
import useGnosisSafe from "../../hooks/useGnosisSafe";
import { useUser } from "../../providers/User";
import { compressImageTo1MB } from "../../utils";
import ImageCropperModal from "./ImageCopperModal";

function Profile() {
    const [isEditing, setIsEditing] = useState({ displayName: false, email: false, walletAddress: false });
    const [isSaving, setIsSaving] = useState(false);
    const [displayName, setName] = useState("John Doe");
    const [email, setEmail] = useState("johndoe@example.com");
    const [image, setImage] = useState();
    const [selectedImage, setSelectedImage] = useState();
    const [walletAddress, setWalletAddress] = useState(null);
    const { firestoreUser, userTeamData, setUserTeamWallet } = useUser();
    const { updateUserData } = useAuth();
    const { refreshSafeList } = useGnosisSafe();
    const backgroundHover = useColorModeValue("gray.100", "whiteAlpha.200");

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
            refreshSafeList({ walletAddress });
        }
        toggleEditing(field);
    };

    const handleImageInput = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = async () => {
            // Get the data URL of the uploaded file
            const dataURL = reader.result;
            setSelectedImage(dataURL);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleImageSave = (cropper) => {
        setIsSaving(true);
        try {
            cropper.getCroppedCanvas().toBlob((blob) => {
                compressImageTo1MB(blob, async (compressedBlob) => {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const imageUri = reader.result;
                        const storage = getStorage();

                        const imageRef = ref(storage, `profile-images/${firestoreUser.uid}`);

                        // Upload the data URL to Firebase Storage
                        const uploadTaskSnapshot = await uploadString(imageRef, imageUri, "data_url");

                        // Get the download URL of the uploaded image
                        const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);

                        // Update the image state
                        setImage(downloadURL);
                        updateUserData(firestoreUser, { photoURL: downloadURL });
                        setSelectedImage(null);
                        setIsSaving(false);
                    };
                    reader.readAsDataURL(compressedBlob);
                });
            }, "image/jpeg");
        } catch (error) {
            setIsSaving(false);
            console.error(error);
        }
    };

    return (
        <Box minWidth="500px" padding="10px">
            <Flex justifyContent="space-between" alignItems="center">
                <Box>
                    <Heading mb="10px" size="lg">
                        Profile
                    </Heading>
                    <Text>Change your profile information such as name, profile picture, and wallet address.</Text>
                </Box>
                <Box>
                    <label htmlFor="image-upload">
                        <input
                            type="file"
                            hidden
                            id="image-upload"
                            onChange={handleImageInput}
                            aria-label="Profile Picture Upload"
                            accept="image/*"
                        />
                        <Circle size="70px" cursor="pointer" _hover={{ backgroundColor: backgroundHover }}>
                            {image ? (
                                <Image src={image} alt="Profile" objectFit="cover" borderRadius="50%" />
                            ) : (
                                <IoImageOutline size="60%" />
                            )}
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
                    <Text textAlign="center" flex="1" marginLeft="59px">
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
                {/* we don't support email edit yet */}
                {/* <Button isDisabled onClick={() => saveProfile("email")}>
                    {isEditing.email ? "Save" : "Edit"}
                </Button> */}
            </Flex>
            <Divider my={4} />
            <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">Wallet address</Text>
                {isEditing.walletAddress ? (
                    <Input w="70%" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
                ) : (
                    <Text textAlign="center" flex="1">
                        {walletAddress}
                    </Text>
                )}
                <Button
                    onClick={() => saveProfile("walletAddress")}
                    isDisabled={isEditing.walletAddress && !ethers.utils.isAddress(walletAddress)}
                >
                    {isEditing.walletAddress ? "Save" : "Edit"}
                </Button>
            </Flex>
            <ImageCropperModal
                isOpen={Boolean(selectedImage)}
                onClose={() => setSelectedImage(false)}
                isSaving={isSaving}
                selectedImage={selectedImage}
                handleImageSave={(cropper) => handleImageSave(cropper)}
            />
        </Box>
    );
}

export default Profile;

import React from "react";
import {
    Container,
    Flex,
    Image,
    Text,
    Stack,
    Center,
    VStack,
    Box,
} from "@chakra-ui/react";
import PhoneSignIn from "../components/PhoneSignIn";
import iPhone from "../img/transparent_iphone.png";
import background from "../img/wave-haikei.svg";
import video from "../img/test_iphone_video.mp4";
import prontoAILogo from "../img/womanwithphone.png";

function Home() {
    return (
        <Container
            minHeight="100vh"
            minWidth="100vw"
            backgroundImage={background}
            backgroundSize="cover"
        >
            <Flex flexWrap="wrap" height="100vh" alignItems="center">
                <Stack height="68vh" width={{ base: "100vw", lg: "50%" }}>
                    {/* <Image
                        src={logo}
                        boxSize="md"
                        objectFit="cover"
                        width={{
                            base: '80%',
                            sm: '400px',
                        }}
                        height={{ sm: '80%' }}
                        mt="10vh"
                    /> */}
                    <Container position="relative" marginRight={{ lg: "20px" }}>
                        <Image
                            src={iPhone}
                            width={{ base: "352px", lg: "534px" }}
                            height={{ base: "544px", lg: "801px" }}
                            position="absolute"
                            right="0"
                            left="0"
                            marginRight="auto"
                            marginLeft="auto"
                            zIndex={1}
                            top={{ base: "20px", lg: "0px" }}
                        />
                        <Box
                            width={{ base: "330px", lg: "494px" }}
                            autoPlay
                            height={{ base: "495px", lg: "741px" }}
                            src={video}
                            as="video"
                            zIndex={0}
                            position="absolute"
                            right="0"
                            left="0"
                            marginRight="auto"
                            marginLeft="auto"
                            top={{ base: "35px", lg: "12px" }}
                            loop
                        />
                    </Container>
                </Stack>
                <Center
                    width={{ base: "100%", lg: "50%" }}
                    display="flex"
                    flexDirection="row"
                    justifyContent={{ base: "center", xl: "flex-start" }}
                    mb="36vh"
                >
                    <VStack>
                        <Container position="relative">
                            <Image
                                src={prontoAILogo}
                                position="absolute"
                                width="70px"
                                left="30px"
                                top="10px"
                                borderRadius="40px"
                            />
                        </Container>
                        <Text fontSize="5xl">ProntoAI</Text>
                        <Text textAlign="center" fontSize="2xl">
                            Answers to any question, anywhere, instantly.
                        </Text>
                        <PhoneSignIn />
                    </VStack>
                </Center>
            </Flex>
        </Container>
    );
}

export default Home;

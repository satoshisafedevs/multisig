import React from "react";
import {
    Alert,
    AlertIcon,
    AlertTitle,
    Box,
    AlertDescription,
    CloseButton,
    Center,
    Image,
    Text,
    Code,
    HStack,
} from "@chakra-ui/react";
import { PropTypes } from "prop-types";
import boratSuccess from "../img/borat_success.gif";

export default function StatusAlert({ signInStatus, resetFlow, errorMsg }) {
    let message = "";
    let status = "";
    let title = "";
    if (signInStatus === "signInSuccess") {
        status = "success";
        title = "🎉 Great Success!";
        message = "You are ready to go. Expect a text from ChatGPT shortly.";
    } else if (signInStatus === "verificationFailure") {
        status = "error";
        title = "Failed!";
        message = "Wrong verification code";
    } else if (signInStatus === "phoneNumberFailure") {
        status = "error";
        title = "Failed!";
        message = "Something went wrong.";
    } else {
        status = "error";
        title = "Failed!";
        message = "Something went wrong.";
    }

    return (
        <Center m={10}>
            <Alert status={status}>
                {status === "success" ? (
                    <Image
                        src={boratSuccess}
                        objectFit="cover"
                        width="100px"
                        mr="10px"
                    />
                ) : (
                    <AlertIcon />
                )}
                <HStack>
                    <Box>
                        <AlertTitle>{title}</AlertTitle>
                        <AlertDescription>
                            <Text>{message}</Text>
                            <Code>{errorMsg}</Code>
                        </AlertDescription>
                    </Box>
                </HStack>

                <CloseButton
                    alignSelf="flex-start"
                    position="relative"
                    right={-1}
                    top={-1}
                    onClick={() => resetFlow()}
                />
            </Alert>
        </Center>
    );
}
StatusAlert.propTypes = {
    signInStatus: PropTypes.string,
    resetFlow: PropTypes.func,
    errorMsg: PropTypes.string,
};

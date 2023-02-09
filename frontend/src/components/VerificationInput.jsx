import React from "react";
import { HStack, Center, Spinner, Text, Stack } from "@chakra-ui/react";
import OtpInput from "react-otp-input";
import { PropTypes } from "prop-types";

export default function VerificationInput({ pinChange, spinner, pin }) {
    if (spinner) {
        return (
            <Center>
                <Spinner color="orange" size="lg" random={spinner} />
            </Center>
        );
    }

    return (
        <Stack m={10}>
            <Center>
                <HStack>
                    <OtpInput
                        value={pin}
                        onChange={pinChange}
                        numInputs={6}
                        inputStyle={{
                            borderWidth: "1px",
                            height: "40px",
                            width: "40px",
                            borderRadius: "8px",
                            margin: "2px",
                        }}
                    />
                </HStack>
            </Center>

            <Text>Please enter the verification code sent to you.</Text>
        </Stack>
    );
}
VerificationInput.propTypes = {
    pinChange: PropTypes.func,
    spinner: PropTypes.bool,
    pin: PropTypes.string,
};

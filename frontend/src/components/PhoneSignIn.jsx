import React from "react";
import { PropTypes } from "prop-types";
import { Button, Input, Flex, Center, Text, Spinner, Box } from "@chakra-ui/react";
import usePhoneLogin from "../hooks/usePhoneLogin";
import VerificationInput from "./VerificationInput";
import StatusAlert from "./StatusAlert";

function PhoneSignIn() {
    const {
        onPinChange,
        buttonSpinner,
        validNumber,
        phone,
        onPhoneChange,
        signInStatus,
        confirmationNumber,
        signInSubmit,
        resetState,
        errorMsg,
        pin,
    } = usePhoneLogin();

    if (signInStatus) {
        return <StatusAlert signInStatus={signInStatus} resetFlow={resetState} errorMsg={errorMsg} />;
    }

    return (
        <div>
            {confirmationNumber ? (
                <VerificationInput pinChange={onPinChange} spinner={buttonSpinner} pin={pin} />
            ) : (
                <Flex m={5}>
                    <Input
                        mr="10px"
                        type="tel"
                        w="180px"
                        placeholder="phone number"
                        size="md"
                        value={phone}
                        onChange={onPhoneChange}
                        isInvalid={!validNumber}
                    />
                    <Box w="100px" h="40px">
                        {buttonSpinner ? (
                            <Spinner color="orange" size="lg" m="4px" ml="24px" />
                        ) : (
                            <ActionButton signInSubmit={signInSubmit} />
                        )}
                    </Box>
                </Flex>
            )}
            <Center>
                <Text fontSize="sm">Only available in the US (for now)</Text>
            </Center>
        </div>
    );
}

function ActionButton({ signInSubmit }) {
    return (
        <Button colorScheme="orange" onClick={() => signInSubmit()}>
            Text me
        </Button>
    );
}
ActionButton.propTypes = {
    signInSubmit: PropTypes.func,
};

export default PhoneSignIn;

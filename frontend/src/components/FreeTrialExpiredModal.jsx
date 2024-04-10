import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React from "react";

export default function FreeTrialExpiredModal({ isOpen }) {
    return (
        <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={() => console.log("closing")}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Your free trial has expired</ModalHeader>
                <ModalBody pb={6}>
                    <Text>
                        Thank you for exploring SatoshiSafe with our free trial. We hope you enjoyed discovering all the
                        features and benefits it offers.
                    </Text>
                    <br />
                    <Text>
                        To continue enjoying full access to SatoshiSafe and to ensure your data and transactions remain
                        secure and uninterrupted, please subscribe using our Stripe service. Stripe provides a secure,
                        easy-to-use payment platform, allowing you to choose from various subscription options tailored
                        to your needs.
                    </Text>
                    <br />
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3}>
                        Subscribe
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
FreeTrialExpiredModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
};

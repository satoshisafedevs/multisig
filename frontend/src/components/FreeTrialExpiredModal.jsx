import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { getPaymentLink } from "../firebase";
import { useUser } from "../providers/User";

export default function FreeTrialExpiredModal({ isOpen }) {
    const [loading, setLoading] = useState(null);
    const { currentTeam } = useUser();
    const goToPayment = async () => {
        setLoading(true);
        const response = await getPaymentLink({
            // Note: for now we just use one subscription type.
            lookupKey: "PREMIUM",
            teamId: currentTeam.id,
        });
        window.open(response.data, "_blank").focus();
    };
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
                    <Button colorScheme="blue" mr={3} onClick={goToPayment} isLoading={loading}>
                        Subscribe
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
FreeTrialExpiredModal.propTypes = {
    isOpen: PropTypes.bool,
};

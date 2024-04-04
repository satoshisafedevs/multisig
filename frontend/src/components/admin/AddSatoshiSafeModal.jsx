import {
    Button,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Td,
    useColorModeValue,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { IoAddCircleOutline, IoEnterOutline } from "react-icons/io5";
import { useUser } from "../../providers/User";
import CreateNewSafeModal from "./CreateNewSafeModal";
import ImportSafeModal from "./ImportSafeModal";
import useGnosisSafe from "../../hooks/useGnosisSafe";

function AddSatoshiSafeModal({ isOpen, setIsOpen }) {
    const tableBorderColor = useColorModeValue("gray.100", "gray.600");
    const { currentTeam, userTeamData } = useUser();
    const [modalState, setModalState] = useState("welcome");
    const [checkedSafes, setCheckedSafes] = useState({});
    const { importSafes } = useGnosisSafe();

    const onClose = () => {
        setIsOpen(false);
        setModalState("welcome");
        setCheckedSafes({});
    };

    const renderTd = (content, idx) => (
        <Td
            _firstLetter={{
                textTransform: "capitalize",
            }}
            borderColor={tableBorderColor}
            borderBottom={userTeamData.userSafes.length - 1 === idx ? "none" : "inherit"}
        >
            {content}
        </Td>
    );

    const handleCheckboxChange = (safeAddress) => {
        setCheckedSafes((prevState) => ({
            ...prevState,
            [safeAddress]: !prevState[safeAddress],
        }));
    };

    const importSafeContent = () => {
        if (modalState === "welcome") {
            return (
                <>
                    <ModalHeader>Welcome to Satoshi Safe</ModalHeader>
                    <ModalCloseButton top="var(--chakra-space-3)" />
                    <ModalBody paddingTop="0">
                        Satoshi Safe app utilizes multi-signature (multi-sig) wallets to enhance the safety of your
                        assets beyond what&apos;s offered by hot wallets like MetaMask, or even standalone hardware
                        wallets. You can start by either importing an existing Gnosis Safe or creating a new one.
                        <Flex padding="50px" justify="space-around">
                            <Button
                                colorScheme="blueSwatch"
                                size="lg"
                                leftIcon={<IoAddCircleOutline size="20px" />}
                                onClick={() => setModalState("new")}
                            >
                                Create new Safe
                            </Button>
                            <Button
                                colorScheme="blueSwatch"
                                size="lg"
                                leftIcon={<IoEnterOutline size="20px" />}
                                onClick={() => setModalState("import")}
                            >
                                Import Gnosis Safe
                            </Button>
                        </Flex>
                    </ModalBody>
                </>
            );
        }
        if (modalState === "import") {
            return (
                <ImportSafeModal
                    userTeamData={userTeamData}
                    setModalState={setModalState}
                    currentTeam={currentTeam}
                    checkedSafes={checkedSafes}
                    handleCheckboxChange={handleCheckboxChange}
                    importSafes={importSafes}
                    onClose={onClose}
                    renderTd={renderTd}
                />
            );
        }
        if (modalState === "new") {
            return <CreateNewSafeModal onClose={onClose} setModalState={setModalState} />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent>{importSafeContent()}</ModalContent>
        </Modal>
    );
}

AddSatoshiSafeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
};

export default AddSatoshiSafeModal;

import React, { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    useColorModeValue,
} from "@chakra-ui/react";
import { IoSearchOutline } from "react-icons/io5";

function SelectTokenModal({ tokens, isOpen, setIsOpen, setToken }) {
    const [searchString, setSearchString] = useState("");
    const descriptionColor = useColorModeValue("blackAlpha.600", "whiteAlpha.600");
    const searchTokenRef = useRef();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchTokenRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    const onClose = () => {
        setIsOpen(false);
        setSearchString("");
    };

    const handleTokenSearch = (e) => {
        setSearchString(e.target.value);
    };

    const searchTokens = useMemo(() => {
        if (tokens && searchString) {
            return tokens.filter(
                (token) =>
                    token.symbol.toLowerCase().includes(searchString.toLowerCase()) ||
                    token.name.toLowerCase().includes(searchString.toLowerCase()),
            );
        }
        return tokens;
    }, [tokens, searchString]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton top="var(--chakra-space-3)" />
                <ModalHeader>Select token</ModalHeader>
                <ModalBody paddingTop="0" paddingBottom="0">
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <IoSearchOutline color="gray.300" />
                        </InputLeftElement>
                        <Input
                            onChange={handleTokenSearch}
                            value={searchString}
                            placeholder="Search tokens..."
                            ref={searchTokenRef}
                        />
                    </InputGroup>
                    <Box fontSize="small" padding="5px 5px 0 5px" color={descriptionColor}>
                        {searchTokens.length} Tokens
                    </Box>
                    {tokens.length === 0 && (
                        <Alert status="warning" marginTop="5px">
                            <AlertIcon />
                            Ensure a safe is chosen before selecting a token
                        </Alert>
                    )}
                    {tokens.length > 0 && searchTokens.length === 0 ? (
                        <Alert status="warning" marginTop="5px">
                            <AlertIcon />
                            No results found
                        </Alert>
                    ) : (
                        <Box maxHeight="50vh" overflow="auto" margin="0 -5px">
                            {searchTokens.map((token) => (
                                <Box display="flex" flexDirection="row" key={token.name + token.symbol}>
                                    <Button
                                        height="50px"
                                        fontWeight="normal"
                                        flexGrow="1"
                                        justifyContent="start"
                                        paddingLeft="5px"
                                        margin="5px"
                                        variant="ghost"
                                        leftIcon={
                                            // eslint-disable-next-line react/jsx-wrap-multilines
                                            <Image
                                                boxSize="2rem"
                                                borderRadius="full"
                                                src={token.logoURI}
                                                alt={token.symbol}
                                                mr="12px"
                                                loading="lazy"
                                            />
                                        }
                                        onClick={() => {
                                            setToken({
                                                symbol: token.symbol,
                                                logoURI: token.logoURI,
                                                address: token.address,
                                            });
                                            onClose();
                                        }}
                                    >
                                        <Box display="flex" flexDirection="column" alignItems="start">
                                            {token.symbol}
                                            <br />
                                            <Box fontSize="smaller" color={descriptionColor}>
                                                {token.name}
                                            </Box>
                                        </Box>
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    )}
                </ModalBody>
                <ModalFooter padding="1.5rem 0 0 0" />
            </ModalContent>
        </Modal>
    );
}

SelectTokenModal.propTypes = {
    tokens: PropTypes.arrayOf(PropTypes.shape({})),
    isOpen: PropTypes.bool,
    setIsOpen: PropTypes.func,
    setToken: PropTypes.func,
};
export default SelectTokenModal;

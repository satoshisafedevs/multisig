import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    TableCaption,
    useColorModeValue,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from "@chakra-ui/react";
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { usdFormatter } from "../utils";
import theme from "../theme";
import WalletAssetsTable from "./WalletAssetsTable";

function StakedAssetsTable({ todaysAggregatedSafesStakedAssets }) {
    const tableBorderColor = useColorModeValue(theme.colors.gray[100], theme.colors.gray[600]);
    const hoverColor = useColorModeValue("blackAlpha.900", "whiteAlpha.900");
    const [sorting, setSorting] = useState([{ id: "USD Value", desc: true }]);

    const StyledTd = styled(Td)`
        border-color: ${tableBorderColor};
    `;

    const data = React.useMemo(() => todaysAggregatedSafesStakedAssets.balances, [todaysAggregatedSafesStakedAssets]);

    const columns = React.useMemo(
        () => [
            {
                accessorFn: (row) => Object.values(row)[0],
                header: "Asset Name",
                meta: {
                    isFirst: true,
                },
            },
            { accessorFn: (row) => Object.values(row)[1], header: "USD Value" },
        ],
        [],
    );

    const tableInstance = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
        enableSortingRemoval: false,
    });

    const renderCell = (cell) => {
        const { getValue } = cell;
        const value = getValue();

        if (cell.column.id === "USD Value") {
            if (value === 0) {
                return "$0.00";
            }
            if (value < 0.01) {
                return "<$0.01";
            }
            return usdFormatter.format(value);
        }

        return value;
    };

    const sortingIcon = (header) => {
        const iconStyle = { display: "inline", marginLeft: "5px", verticalAlign: "sub" };

        if (header.column.getIsSorted() === "desc") {
            return <IoChevronDownOutline size="15px" style={iconStyle} aria-label="sorted descending" />;
        }
        if (header.column.getIsSorted() === "asc") {
            return <IoChevronUpOutline size="15px" style={iconStyle} aria-label="sorted ascending" />;
        }
        return <span style={{ width: "20px", display: "inline-block" }} />;
    };

    return (
        <TableContainer paddingTop="20px">
            <Table variant="simple" size="sm">
                <Thead>
                    {tableInstance.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    cursor="pointer"
                                    paddingLeft={header.column.columnDef?.meta?.isFirst && "0"}
                                    paddingRight={!header.column.columnDef?.meta?.isFirst && "0"}
                                    _hover={{
                                        color: hoverColor,
                                    }}
                                >
                                    {header.column.columnDef.header}
                                    {sortingIcon(header)}
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </Thead>
                <Tbody>
                    {tableInstance.getRowModel().rows.map((row) => (
                        <Tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <StyledTd
                                    key={cell.id}
                                    paddingLeft={cell.column.columnDef?.meta?.isFirst && "0"}
                                    paddingRight={!cell.column.columnDef?.meta?.isFirst && "0"}
                                >
                                    {cell.column.id === "Asset Name" ? (
                                        <Accordion allowMultiple>
                                            <AccordionItem border="none">
                                                <AccordionButton padding="0" fontSize="sm">
                                                    <AccordionIcon />
                                                    {renderCell(cell)}
                                                </AccordionButton>
                                                <AccordionPanel>
                                                    <WalletAssetsTable
                                                        todaysAggregatedSafesWalletAssets={{
                                                            balances: cell.row.original.assets,
                                                        }}
                                                    />
                                                </AccordionPanel>
                                            </AccordionItem>
                                        </Accordion>
                                    ) : (
                                        renderCell(cell)
                                    )}
                                </StyledTd>
                            ))}
                        </Tr>
                    ))}
                    <Tr>
                        <StyledTd paddingLeft="0" border="none">
                            Total
                        </StyledTd>
                        <StyledTd paddingRight="0" border="none">
                            {usdFormatter.format(todaysAggregatedSafesStakedAssets.totalUSDValue)}
                        </StyledTd>
                    </Tr>
                </Tbody>
                <TableCaption>Combined USD value(s) across all safes for today.</TableCaption>
            </Table>
        </TableContainer>
    );
}

StakedAssetsTable.propTypes = {
    todaysAggregatedSafesStakedAssets: PropTypes.shape({
        balances: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
        totalUSDValue: PropTypes.number.isRequired,
    }).isRequired,
};
export default StakedAssetsTable;

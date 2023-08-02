import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, TableCaption, useColorModeValue } from "@chakra-ui/react";
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { usdFormatter, formatNumber } from "../utils";
import theme from "../theme";

function WalletAssetsTable({ todaysAggregatedSafesWalletAssets }) {
    const tableBorderColor = useColorModeValue(theme.colors.gray[100], theme.colors.gray[600]);
    const hoverColor = useColorModeValue("blackAlpha.900", "whiteAlpha.900");
    const [sorting, setSorting] = useState([{ id: "USD Value", desc: true }]);

    const StyledTd = styled(Td)`
        border-color: ${tableBorderColor};
    `;

    const data = React.useMemo(() => todaysAggregatedSafesWalletAssets.balances, [todaysAggregatedSafesWalletAssets]);

    const columns = React.useMemo(
        () => [
            {
                accessorFn: (row) => Object.values(row)[0],
                header: "Asset Name",
                meta: {
                    isFirst: true,
                },
            },
            { accessorFn: (row) => Object.values(row)[1], header: "Price" },
            { accessorFn: (row) => Object.values(row)[2], header: "Amount" },
            { accessorFn: (row) => Object.values(row)[3], header: "USD Value" },
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

        if (cell.column.id === "Price") {
            return formatNumber(value, true);
        }

        if (cell.column.id === "Amount") {
            return formatNumber(value);
        }

        if (cell.column.id === "USD Value") {
            if (value === 0) {
                return "$0.00";
            }
            if (value > 0 && value < 0.01) {
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
                    {tableInstance.getRowModel().rows.map((row, index) => {
                        const isLastRow = index === tableInstance.getRowModel().rows.length - 1;

                        return (
                            <Tr key={row.id} className={isLastRow ? "last-row" : ""}>
                                {row.getVisibleCells().map((cell) => (
                                    <StyledTd
                                        key={cell.id}
                                        paddingLeft={cell.column.columnDef?.meta?.isFirst && "0"}
                                        paddingRight={!cell.column.columnDef?.meta?.isFirst && "0"}
                                        border={
                                            isLastRow && !todaysAggregatedSafesWalletAssets.totalUSDValue
                                                ? "none"
                                                : "auto"
                                        }
                                    >
                                        {renderCell(cell)}
                                    </StyledTd>
                                ))}
                            </Tr>
                        );
                    })}
                    {todaysAggregatedSafesWalletAssets.totalUSDValue && (
                        <Tr>
                            <StyledTd paddingLeft="0" border="none">
                                Total
                            </StyledTd>
                            <StyledTd border="none"> </StyledTd>
                            <StyledTd border="none"> </StyledTd>
                            <StyledTd paddingRight="0" border="none">
                                {usdFormatter.format(todaysAggregatedSafesWalletAssets.totalUSDValue)}
                            </StyledTd>
                        </Tr>
                    )}
                </Tbody>
                {todaysAggregatedSafesWalletAssets.totalUSDValue && (
                    <TableCaption>Combined USD value(s) across all safes for today.</TableCaption>
                )}
            </Table>
        </TableContainer>
    );
}

WalletAssetsTable.propTypes = {
    todaysAggregatedSafesWalletAssets: PropTypes.shape({
        balances: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
        totalUSDValue: PropTypes.number,
    }).isRequired,
};
export default WalletAssetsTable;

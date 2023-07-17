import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, TableCaption, useColorModeValue } from "@chakra-ui/react";
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import theme from "../theme";

function AssetsTable({ todaysAggregatedBalance }) {
    const tableBorderColor = useColorModeValue(theme.colors.gray[100], theme.colors.gray[600]);
    const hoverColor = useColorModeValue("blackAlpha.900", "whiteAlpha.900");

    const StyledTd = styled(Td)`
        border-color: ${tableBorderColor};
    `;

    const data = React.useMemo(() => todaysAggregatedBalance.nonZeroUSDValueChains, [todaysAggregatedBalance]);

    const columns = React.useMemo(
        () => [
            {
                accessorFn: (row) => Object.keys(row)[0],
                header: "Asset Name",
                meta: {
                    isFirst: true,
                },
            },
            { accessorFn: (row) => Object.values(row)[0], header: "USD Value" },
        ],
        [],
    );

    const tableInstance = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableSortingRemoval: false,
    });

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    });

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
                                    {(() => {
                                        const { getValue } = cell;
                                        const value = getValue();
                                        return typeof value === "number" ? formatter.format(value) : value;
                                    })()}
                                </StyledTd>
                            ))}
                        </Tr>
                    ))}
                    <Tr>
                        <StyledTd paddingLeft="0">Total</StyledTd>
                        <StyledTd paddingRight="0">{formatter.format(todaysAggregatedBalance.totalUSDValue)}</StyledTd>
                    </Tr>
                </Tbody>
                <TableCaption>Combined USD value(s) across all safes for today.</TableCaption>
            </Table>
        </TableContainer>
    );
}

AssetsTable.propTypes = {
    todaysAggregatedBalance: PropTypes.shape({
        nonZeroUSDValueChains: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
        totalUSDValue: PropTypes.number.isRequired,
    }).isRequired,
};
export default AssetsTable;

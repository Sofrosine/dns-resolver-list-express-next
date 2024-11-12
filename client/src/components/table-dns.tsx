"use client"

import React, {useEffect, useState} from 'react';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import {Input} from "@/components/ui/input";
import {useDebounce} from "@/lib/hooks";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {TABLE_LIMITS} from "@/constants";
import {Skeleton} from "@/components/ui/skeleton";



const TableDns = () => {
    const [data, setData] = useState<IDomainResponse | null>(null)
    const [searchText, setSearchText] = useState("");
    const [limit, setLimit] = useState("20");
    const [loading, setLoading] = useState(true);

    const debounceSearch = useDebounce(searchText, 300);

    useEffect(() => {
        fetchDomains()
    }, [debounceSearch, limit]);

    const fetchDomains = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/domains?page=1&limit=${limit}&domain=${debounceSearch}`);
            const data: IDomainResponse = await res.json();
            setData(data)
        } catch (e) {
            console.error(e)
            alert("Error load domain")
        } finally {
            setLoading(false);
        }
    };

    return loading ? <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl"/>
        <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]"/>
            <Skeleton className="h-4 w-[200px]"/>
        </div>
    </div> : (
        <div className={'w-full lg:w-3/4'}>
            <Input placeholder={"Search by domain name..."} value={searchText}
                   onChange={(e) => setSearchText(e.target.value)}/>
            <Table className={'mt-4 md:mt-8'}>
                <TableCaption>We have {data?.total_records} total domains, go search your desired domain with input
                    above</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">No</TableHead>
                        <TableHead>Domain Name</TableHead>
                        <TableHead>SPF Status</TableHead>
                        <TableHead>DKIM Status</TableHead>
                        <TableHead>DMARC Status</TableHead>
                        <TableHead>Last Checked</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.data?.map((val, i) => {
                        return (
                            <TableRow key={val?.id}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                    <Link className={'underline'} href={`https://${val?.domain_name}`}
                                          target={"_blank"}>{val?.domain_name}</Link>
                                </TableCell>
                                <TableCell>{val?.spf_status}</TableCell>
                                <TableCell>{val?.dkim_status}</TableCell>
                                <TableCell>{val?.dmarc_status}</TableCell>
                                <TableCell>{new Date(val?.last_checked)?.toString()}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            <div className={'w-full mt-8 flex justify-between items-center'}>
                <Select onValueChange={value => setLimit(value)} value={limit}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Limit"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {TABLE_LIMITS.map(val => {
                                return <SelectItem key={val?.value} value={val?.value}>{val?.label}</SelectItem>
                            })}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default TableDns;

interface IDomainResponse {
    "success": boolean,
    "page": number
    "per_page": number,
    "total_pages": number,
    "total_records": number,
    "data": IDomain[]
}

interface IDomain {
    "id": number,
    "domain_name": string,
    "spf_status": string,
    "dkim_status": string,
    "dmarc_status": string,
    "last_checked": string
}
const getDomains = async (req, res, client) => {
    const {page = 1, limit = 10, domain} = req.query; // Default to page 1, limit 10
    const offset = (page - 1) * limit; // Calculate the offset for pagination

    let query = `SELECT * FROM domains WHERE 1=1`;
    const params = [];

    // If domain query is provided, filter by domain name
    if (domain) {
        query += ` AND domain_name ILIKE $${params.length + 1}`; // ILIKE for case-insensitive search
        params.push(`%${domain}%`); // Wrap domain in "%" for partial matching
    }

    // Apply pagination (LIMIT and OFFSET)
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    try {
        // Query to fetch the filtered domains with pagination
        const result = await client.query(query, params);

        // Query to fetch the total count of domains (for calculating total pages)
        const countQuery = `SELECT COUNT(*) FROM domains WHERE 1=1 ${domain ? ' AND domain_name ILIKE $1' : ''}`;
        const countParams = domain ? [`%${domain}%`] : [];
        const countResult = await client.query(countQuery, countParams);
        const totalCount = parseInt(countResult.rows[0].count, 10);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        // Return the response with pagination details
        res.json({
            success: true,
            page: parseInt(page, 10),
            per_page: parseInt(limit, 10),
            total_pages: totalPages,
            total_records: totalCount,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error fetching domains:", error);
        res.status(500).json({success: false, error: "An error occurred while fetching domains."});
    }
};


module.exports = {getDomains};
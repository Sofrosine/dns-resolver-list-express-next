const fs = require("fs");
const {exec} = require("child_process");
const csv = require("csv-parser");
const path = require("path");

async function checkDNSRecords(domain) {
    return new Promise((resolve) => {
        const results = { domain, spf: "Not Found", dkim: "Not Found", dmarc: "Not Found" };

        // SPF Check
        exec(`dig TXT ${domain} +short`, (error, stdout) => {
            if (!error && stdout.includes("v=spf1")) {
                results.spf = "Valid SPF";
            }

            // DKIM Check for Google
            exec(`dig TXT google._domainkey.${domain} +short`, (error, stdout) => {
                if (!error && stdout) {
                    results.dkim = "Valid DKIM (Google)";
                }

                // DKIM Check for Microsoft
                exec(`dig TXT selector1._domainkey.${domain} +short`, (error, stdout) => {
                    if (!error && stdout) {
                        results.dkim = "Valid DKIM (Microsoft)";
                    }

                    // DMARC Check
                    exec(`dig TXT _dmarc.${domain} +short`, (error, stdout) => {
                        if (!error && stdout.includes("v=DMARC1")) {
                            results.dmarc = "Valid DMARC";
                        }

                        resolve(results);
                    });
                });
            });
        });
    });
}


module.exports = async function importDomainsAndCheckRecords(client) {
    const csvFilePath = path.resolve(__dirname, "../assets/domain_names.csv");
    fs.createReadStream(csvFilePath)
        .pipe(csv({headers: ["domain"]}))  // Manually set a header
        .on("data", async (row) => {
            const domain = row.domain;

            const dnsRecords = await checkDNSRecords(domain);

            await client.query(
                `INSERT INTO domains (domain_name, spf_status, dkim_status, dmarc_status, last_checked)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (domain_name) DO UPDATE
     SET spf_status = EXCLUDED.spf_status,
         dkim_status = EXCLUDED.dkim_status,
         dmarc_status = EXCLUDED.dmarc_status,
         last_checked = NOW()`,
                [dnsRecords.domain, dnsRecords.spf, dnsRecords.dkim, dnsRecords.dmarc]
            );

        })
        .on("error", async (err) => {
            console.error("Error running DNS check:", err);
            await client.end();
        })
        .on("end", async () => {
            console.log("Domain check completed.");
            // await client.end();
        })

}
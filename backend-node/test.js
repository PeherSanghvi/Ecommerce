const mongoose = require("mongoose");

const uri =
"mongodb+srv://pehersanghvi32_db_user:3bmzvy4niTtCNIdL@ecom.loezjbw.mongodb.net/?retryWrites=true&w=majority&appName=Ecom";

async function main() {
    try {
        await mongoose.connect(uri);
        console.log("✅ Connected!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
// server/service/offerService.js
const { prisma } = require("../config/database");
const cron = require("node-cron");

// Enable weekend offers every Friday at 5 PM
cron.schedule("0 17 * * 5", async () => {
  await prisma.product.updateMany({
    where: { isWeekendOffer: true },
    data: { isWeekendOffer: true } // Activate offers
  });
  console.log("Weekend offers enabled");
});

// Disable weekend offers every Monday at 9 AM
cron.schedule("0 9 * * 1", async () => {
  await prisma.product.updateMany({
    where: { isWeekendOffer: true },
    data: { isWeekendOffer: false } // Deactivate offers
  });
  console.log("Weekend offers disabled");
});

module.exports = cron;
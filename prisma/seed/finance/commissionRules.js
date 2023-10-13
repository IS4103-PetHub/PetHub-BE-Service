const commissionRules = [
    { commissionRuleId: 1, name: "Default", commissionRate: 0.01 },
];


async function seedCommissionRule(prisma) {

    // Seed commissionRules
    for (const rule of commissionRules) {
        await prisma.commissionRule.upsert({
            where: { commissionRuleId: rule.commissionRuleId },
            update: rule,
            create: rule
        });
    }

    console.log('Seeding commission rule completed!');
}

module.exports = {
    seedCommissionRule
}

const Campaign = require("../models/campaign");
const classifyVouchers = async (randomNumber, campaignID) => {
    // const vouchers = await Campaign.findById(campaignID).select('vouchers');
    const vouchers = [
        {'quantity': 10, 'discount': 30},
        {'quantity': 20, 'discount': 20},
        {'quantity': 5, 'discount': 10},
        {'quantity': 15, 'discount': 15},
        {'quantity': 8, 'discount': 25}
    ]
    vouchers.sort((a, b) => b.discount - a.discount);
    const totalDiscount = vouchers.reduce((acc, cur) => acc + cur.discount, 0);
    let value = 0
    const cumulativeDiscount = vouchers.map((x) => {
        value += x.discount / totalDiscount
        return value
    });
    for (let i = 0; i < vouchers.length; i++) {
        if (randomNumber <= cumulativeDiscount[i]) {
            return vouchers[i].discount
        }
    }
}
const random = Math.random();
const checkDiscountAndAmount = async (campaignID,discount) => {
    const vouchers = await Campaign.findById(campaignID).select('vouchers');
    const voucher = vouchers.vouchers
    let amount = 0;
    for (let i = 0; i < voucher.length; i++) {
        if (voucher[i].discount === discount) {
            amount = voucher[i].amount
            break
        }
    }
    if (amount > 0) {
        await Campaign.findByIdAndUpdate(campaignID, {
            $inc: {
                "vouchers.$[elem].amount": -1
            }
        })
        return true
    }else return false
}
checkDiscountAndAmount('63edd66ca594dba25d3629e8', 30).then(console.log)

const Category = require('../models/category');
exports.createCategory = async (req, res) => {
    try{
        const category = new Category(req.body);
        await category.save();
        res.status(201).send({success: true, message: 'Category created successfully'});
    }catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
}

exports.getAllCategory = async (req, res) => {
    try{
        const categories = await Category.find();
        res.status(200).send({success: true, message: 'Get all categories successfully', categories});
    }catch (e) {
        res.status(400).send({success: false, message: e.message});
    }
}

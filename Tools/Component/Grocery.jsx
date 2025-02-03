import React, { useState, useEffect } from 'react';
import { Back } from './back';

const groceryImages = [
    { name: 'Apple', image: '../src/assets/Apple.png' },
    { name: 'Banana', image: '../src/assets/Banana.png' },
    { name: 'Milk', image: '../src/assets/image.png' },
    { name: 'Bread', image: '../src/assets/Bread.png' },
    { name: 'Broccoli', image: '../src/assets/Broccoli.png' },
    { name: 'Cabbage', image: '../src/assets/Cabbage.png' },
    { name: 'Carrot', image: '../src/assets/Carrot.png' },
    { name: 'Chili', image: '../src/assets/Chili.png' },
    { name: 'Ice-cream', image: '../src/assets/Ice-cream.png' },
    { name: 'Kiwi', image: '../src/assets/Kiwi.png' },
    { name: 'Lemon', image: '../src/assets/Lemon.png' },
    { name: 'Lime', image: '../src/assets/Lime.png' },
    { name: 'Pea', image: '../src/assets/Pea.png' },
    { name: 'Strawberry', image: '../src/assets/Strawberry.png' },
    { name: 'Tomato', image: '../src/assets/Tomato.png' },
];

const Grocery = () => {
    const [groceries, setGroceries] = useState([]);
    const [input, setInput] = useState({ name: '', quantity: '', image: null });
    const [editIndex, setEditIndex] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    useEffect(() => {
        const savedGroceries = JSON.parse(localStorage.getItem('groceries')) || [];
        setGroceries(savedGroceries);
    }, []);

    useEffect(() => {
        if (groceries.length > 0) {
            localStorage.setItem('groceries', JSON.stringify(groceries));
        }
    }, [groceries]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput((prev) => ({ ...prev, [name]: value }));
    };

    const openImageModal = () => {
        setIsImageModalOpen(true);
    };

    const handleImageSelect = (image) => {
        setInput((prev) => ({ ...prev, image }));
        setIsImageModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.name && input.quantity && input.image) {
            if (editIndex !== null) {
                const updatedGroceries = [...groceries];
                updatedGroceries[editIndex] = input;
                setGroceries(updatedGroceries);
                setEditIndex(null);
            } else {
                setGroceries([...groceries, input]);
            }
            setInput({ name: '', quantity: '', image: null });
        }
    };

    const handleEdit = (index) => {
        setEditIndex(index);
        setInput(groceries[index]);
    };

    const handleDelete = (index) => {
        const updatedGroceries = groceries.filter((_, i) => i !== index);
        setGroceries(updatedGroceries);
        localStorage.setItem('groceries', JSON.stringify(updatedGroceries));
    };

    const handleDownload = () => {
        let listText = groceries.map(
            (grocery) => `Item: ${grocery.name}, Quantity: ${grocery.quantity}`
        ).join('\n');

        const element = document.createElement('a');
        const file = new Blob([listText], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'grocery-list.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-2 sm:p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="relative p-4 sm:p-6">
                        <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                            <Back />
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black">
                            Grocery List
                        </h1>
                    </div>

                    {/* Main Content */}
                    <div className="p-4 sm:p-6 md:p-8">
                        {/* Add/Edit Form */}
                        <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        value={input.name}
                                        onChange={handleChange}
                                        placeholder="Item name"
                                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="quantity"
                                        value={input.quantity}
                                        onChange={handleChange}
                                        placeholder="Quantity"
                                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={openImageModal}
                                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm text-gray-700 hover:from-blue-100 hover:to-gray-200 transition-all flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Select Image
                                </button>
                                {input.image && (
                                    <img
                                        src={input.image}
                                        alt="Selected"
                                        className="w-12 h-12 object-cover rounded-xl border border-gray-100 shadow-sm"
                                    />
                                )}
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                                <button
                                    type="submit"
                                    className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-xl bg-blue-600 text-white text-base sm:text-lg font-medium transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                                >
                                    {editIndex !== null ? 'Update Item' : 'Add Item'}
                                </button>
                                {groceries.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-xl bg-gray-600 text-white text-base sm:text-lg font-medium transition-all duration-200 hover:bg-gray-700 hover:shadow-md"
                                    >
                                        Download List
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Grocery List */}
                        <div className="space-y-4">
                            {groceries.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p className="text-gray-500">Your grocery list is empty</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {groceries.map((grocery, index) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 group hover:shadow-md transition-all"
                                        >
                                            {grocery.image && (
                                                <img
                                                    src={grocery.image}
                                                    alt={grocery.name}
                                                    className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm"
                                                />
                                            )}
                                            <div className="flex-grow">
                                                <h3 className="font-semibold text-gray-800">
                                                    {grocery.name}
                                                </h3>
                                                <p className="text-gray-600">
                                                    Quantity: {grocery.quantity}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(index)}
                                                    className="p-2 rounded-xl bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(index)}
                                                    className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Selection Modal */}
            {isImageModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Select an Image
                            </h2>
                            <button
                                onClick={() => setIsImageModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {groceryImages.map((grocery, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleImageSelect(grocery.image)}
                                    className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 ring-offset-2 transition-all"
                                >
                                    <img
                                        src={grocery.image}
                                        alt={grocery.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grocery;

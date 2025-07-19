const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
        const formData = new FormData();
        formData.append('description', description);
        formData.append('amount', amount);
        formData.append('type', type);
        if (photo) {
            formData.append('photo', photo);
        }

        const response = await fetch(`${API_URL}/api/sheets/${sheetId}/entries`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create entry');
        }

        const data = await response.json();
        onEntryCreated(data);
        setDescription('');
        setAmount('');
        setType('income');
        setPhoto(null);
        setPhotoPreview(null);
    } catch (err) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
}; 
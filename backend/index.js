const path = require('path');
     const express = require('express');
     const app = express();

     // Frontend serve karein
     app.use(express.static(path.join(__dirname, 'frontend')));

     // Backend routes
     app.post('/predict', async (req, res) => {
         const data = req.body.data;
         const inputTensor = tf.tensor2d([data]);
         const prediction = await model.predict(inputTensor).dataSync();
         res.json({ prediction: prediction[0] });
     });

     // Server start karein
     const PORT = process.env.PORT || 3000;
     app.listen(PORT, () => {
         console.log(`Server running on port ${PORT}`);
     });

const express = require('express');
   const tf = require('@tensorflow/tfjs-node');
   const cors = require('cors');
   const app = express();

   app.use(cors());
   app.use(express.json());

   let model;

   // Advanced LSTM model create karein
   async function createAdvancedModel() {
       const model = tf.sequential();
       model.add(tf.layers.lstm({ units: 50, inputShape: [10, 1], returnSequences: true }));
       model.add(tf.layers.dropout({ rate: 0.2 }));
       model.add(tf.layers.lstm({ units: 50, returnSequences: false }));
       model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
       model.compile({ optimizer: 'adam', loss: 'meanSquaredError', metrics: ['accuracy'] });
       return model;
   }

   // Model load karein
   async function loadModel() {
       model = await createAdvancedModel();
       console.log("Model loaded successfully.");
   }

   // Prediction endpoint
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
       loadModel();
   });

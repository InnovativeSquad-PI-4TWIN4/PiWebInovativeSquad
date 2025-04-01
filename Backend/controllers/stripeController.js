const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ message: 'Montant ou utilisateur manquant.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Recharge SkillBridge',
            },
            unit_amount: amount * 100, // Stripe attend les montants en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/success?userId=${userId}&amount=${amount}`,
      cancel_url: `http://localhost:5173/cancel`,
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ message: 'Erreur de création de session Stripe', error: error.message });
  }
};

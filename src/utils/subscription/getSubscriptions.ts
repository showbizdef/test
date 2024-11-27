import Subscription from "@schemas/Subscription";

export async function getSubscriptions() {
  const [tierSevenSubscriptions, tierEightSubscriptions] = await Promise.all([
    Subscription.find({ rank: 7 }),
    Subscription.find({ rank: 8 }),
  ]);

  return [tierSevenSubscriptions, tierEightSubscriptions];
}

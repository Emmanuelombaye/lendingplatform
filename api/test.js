export default function (req, res) {
  res.status(200).json({
    status: "alive",
    timestamp: new Date(),
    platform: process.env.VERCEL ? 'vercel' : 'local',
    node: process.version
  });
}

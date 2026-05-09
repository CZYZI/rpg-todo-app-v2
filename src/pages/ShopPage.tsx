import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import { Shop, Star, EmojiEvents } from '@mui/icons-material';
import { useUserStore } from '../store';
import { ShopItem } from '../types';

// 模拟商店物品
const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'skin-medieval-1',
    name: '骑士铠甲皮肤',
    description: '中世纪骑士的传奇铠甲',
    cost: 100,
    type: 'character_skin',
    icon: '🛡️',
    available: true,
  },
  {
    id: 'skin-cyberpunk-1',
    name: '赛博义体皮肤',
    description: '未来感十足的机械义体',
    cost: 150,
    type: 'character_skin',
    icon: '🤖',
    available: true,
  },
  {
    id: 'double-score-1',
    name: '双倍积分卡',
    description: '24小时内获得双倍积分',
    cost: 200,
    type: 'double_score_card',
    icon: '⚡',
    available: true,
  },
  {
    id: 'ai-insight-1',
    name: 'AI深度分析',
    description: '解锁AI深度分析功能',
    cost: 300,
    type: 'ai_insight',
    icon: '🧠',
    available: true,
  },
];

export function ShopPage() {
  const userProfile = useUserStore((s) => s.userProfile);
  const updateUserProfile = useUserStore((s) => s.updateUserProfile);
  
  const [purchased, setPurchased] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handlePurchase = (item: ShopItem) => {
    if (userProfile.totalScore < item.cost) {
      setError('积分不足');
      return;
    }

    if (userProfile.ownedSkins.includes(item.id)) {
      setError('已经拥有此物品');
      return;
    }

    // 购买逻辑
    const newScore = userProfile.totalScore - item.cost;
    const newOwnedSkins = [...userProfile.ownedSkins, item.id];
    
    updateUserProfile({
      totalScore: newScore,
      ownedSkins: newOwnedSkins,
    });

    setPurchased(item.name);
    setError('');
    
    setTimeout(() => setPurchased(null), 3000);
  };

  const getItemsByType = (type: string) => {
    return SHOP_ITEMS.filter((item) => item.type === type);
  };

  return (
    <Box className="max-w-4xl mx-auto p-4">
      <Typography variant="h4" className="mb-6">
        <Shop className="mr-2" />
        兑换商店
      </Typography>

      {/* 用户积分显示 */}
      <Box className="mb-6 p-4 border rounded">
        <Typography variant="h6">
          <Star className="mr-2" />
          当前积分: {userProfile.totalScore}
        </Typography>
      </Box>

      {/* 角色皮肤 */}
      <Typography variant="h5" className="mb-4">
        <EmojiEvents className="mr-2" />
        角色皮肤
      </Typography>
      <Grid container spacing={3} className="mb-6">
        {getItemsByType('character_skin').map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h2" className="text-center mb-2">
                  {item.icon}
                </Typography>
                <Typography variant="h6" className="mb-2">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mb-2">
                  {item.description}
                </Typography>
                <Box className="flex justify-between items-center">
                  <Chip label={`${item.cost} 积分`} color="primary" />
                  <Button
                    variant="contained"
                    onClick={() => handlePurchase(item)}
                    disabled={userProfile.ownedSkins.includes(item.id)}
                  >
                    {userProfile.ownedSkins.includes(item.id) ? '已拥有' : '兑换'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 功能卡片 */}
      <Typography variant="h5" className="mb-4">
        ⚡ 功能卡片
      </Typography>
      <Grid container spacing={3} className="mb-6">
        {getItemsByType('double_score_card').map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h2" className="text-center mb-2">
                  {item.icon}
                </Typography>
                <Typography variant="h6" className="mb-2">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mb-2">
                  {item.description}
                </Typography>
                <Box className="flex justify-between items-center">
                  <Chip label={`${item.cost} 积分`} color="secondary" />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handlePurchase(item)}
                  >
                    兑换
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* AI功能 */}
      <Typography variant="h5" className="mb-4">
        🧠 AI功能
      </Typography>
      <Grid container spacing={3}>
        {getItemsByType('ai_insight').map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h2" className="text-center mb-2">
                  {item.icon}
                </Typography>
                <Typography variant="h6" className="mb-2">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mb-2">
                  {item.description}
                </Typography>
                <Box className="flex justify-between items-center">
                  <Chip label={`${item.cost} 积分`} color="error" />
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handlePurchase(item)}
                    disabled={userProfile.ownedSkins.includes(item.id)}
                  >
                    {userProfile.ownedSkins.includes(item.id) ? '已解锁' : '解锁'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 提示信息 */}
      {purchased && (
        <Alert severity="success" className="mt-4">
          成功兑换: {purchased}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" className="mt-4">
          {error}
        </Alert>
      )}
    </Box>
  );
}

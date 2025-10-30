import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AnimeVideo {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  episode_number: number;
  created_at: string;
}

const Index = () => {
  const [videos, setVideos] = useState<AnimeVideo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    episode_number: ''
  });

  const API_URL = 'https://functions.poehali.dev/ad1562f4-2b61-41af-a479-3f6f0447adfd';

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleDelete = async (videoId: number, videoTitle: string) => {
    if (!confirm(`Удалить "${videoTitle}"?`)) return;

    try {
      const response = await fetch(`${API_URL}?id=${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Видео удалено',
          description: 'Озвучка успешно удалена',
        });
        fetchVideos();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить видео',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          episode_number: parseInt(formData.episode_number) || null
        }),
      });

      if (response.ok) {
        toast({
          title: 'Видео добавлено!',
          description: 'Ваша озвучка успешно загружена',
        });
        setIsDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          video_url: '',
          thumbnail_url: '',
          episode_number: ''
        });
        fetchVideos();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить видео',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div 
        className="relative h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://cdn.poehali.dev/files/12756124-62c5-47ef-b38f-9b97bc43e98b.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        
        <div className="relative z-10 text-center px-4 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            BebraDub
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Качественная русская озвучка любимых аниме
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="hover-scale">
              <Icon name="Play" className="mr-2" size={20} />
              Смотреть
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="hover-scale">
                  <Icon name="Upload" className="mr-2" size={20} />
                  Загрузить видео
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Загрузить новую озвучку</DialogTitle>
                  <DialogDescription>
                    Добавьте ссылку на видео и информацию о нём
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Название аниме *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Например: Атака титанов"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="episode">Номер серии</Label>
                    <Input
                      id="episode"
                      type="number"
                      value={formData.episode_number}
                      onChange={(e) => setFormData({...formData, episode_number: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="video_url">Ссылка на видео *</Label>
                    <Input
                      id="video_url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                      placeholder="https://youtube.com/watch?v=..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">Ссылка на обложку</Label>
                    <Input
                      id="thumbnail"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Краткое описание серии..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Загрузка...' : 'Добавить видео'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2">Наша озвучка</h2>
              <p className="text-muted-foreground">Последние добавленные серии</p>
            </div>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-20">
              <Icon name="Video" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">Пока нет загруженных видео</p>
              <p className="text-sm text-muted-foreground mt-2">Нажмите "Загрузить видео" чтобы добавить первую озвучку</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <Card 
                  key={video.id} 
                  className="group overflow-hidden hover-scale cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Icon name="Film" size={48} className="text-primary" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Icon name="Play" size={48} className="text-white" />
                    </div>
                    {video.episode_number && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                        Серия {video.episode_number}
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{video.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {video.description || 'Смотреть с русской озвучкой'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full group" asChild>
                      <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                        <Icon name="ExternalLink" className="mr-2" size={16} />
                        Смотреть
                      </a>
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(video.id, video.title);
                      }}
                    >
                      <Icon name="Trash2" className="mr-2" size={16} />
                      Удалить
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Контакты</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Свяжитесь с нами для сотрудничества или предложений
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="outline" className="hover-scale">
              <Icon name="Mail" className="mr-2" size={20} />
              Email
            </Button>
            <Button size="lg" variant="outline" className="hover-scale">
              <Icon name="MessageCircle" className="mr-2" size={20} />
              Telegram
            </Button>
            <Button size="lg" variant="outline" className="hover-scale">
              <Icon name="Youtube" className="mr-2" size={20} />
              YouTube
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
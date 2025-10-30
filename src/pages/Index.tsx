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
  anime_series?: string;
  created_at: string;
}

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

const Index = () => {
  const [videos, setVideos] = useState<AnimeVideo[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    episode_number: '',
    anime_series: 'Gachiakuta'
  });
  const [newsFormData, setNewsFormData] = useState({
    title: '',
    content: '',
    image_url: ''
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [newsImagePreview, setNewsImagePreview] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<AnimeVideo | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingNewsImage, setIsUploadingNewsImage] = useState(false);

  const API_URL = 'https://functions.poehali.dev/ad1562f4-2b61-41af-a479-3f6f0447adfd';
  const NEWS_API_URL = 'https://functions.poehali.dev/3c6ea050-fc9a-4302-a957-f39e021872ff';
  const UPLOAD_API_URL = 'https://functions.poehali.dev/42fac570-4fd4-4465-b8fb-56c3504d2a6c';

  useEffect(() => {
    fetchVideos();
    fetchNews();
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

  const fetchNews = async () => {
    try {
      const response = await fetch(NEWS_API_URL);
      const data = await response.json();
      setNews(data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleDelete = async (videoId: number, videoTitle: string) => {
    if (!confirm(`Удалить "${videoTitle}"?`)) return;

    try {
      const response = await fetch(`${API_URL}?id=${videoId}&password=${encodeURIComponent(adminPassword)}`, {
        method: 'DELETE',
      });

      if (response.status === 403) {
        toast({
          title: 'Неверный пароль',
          description: 'Введите правильный пароль администратора',
          variant: 'destructive',
        });
        setIsPasswordDialogOpen(true);
      } else if (response.ok) {
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

  const uploadFile = async (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
          episode_number: parseInt(formData.episode_number) || null,
          anime_series: formData.anime_series,
          admin_password: adminPassword
        }),
      });

      if (response.status === 403) {
        toast({
          title: 'Неверный пароль',
          description: 'Введите правильный пароль администратора',
          variant: 'destructive',
        });
        setIsPasswordDialogOpen(true);
      } else if (response.ok) {
        toast({
          title: 'Видео добавлено!',
          description: 'Ваша озвучка успешно загружена',
        });
        setIsDialogOpen(false);
        setIsAuthenticated(true);
        setFormData({
          title: '',
          description: '',
          video_url: '',
          thumbnail_url: '',
          episode_number: '',
          anime_series: 'Gachiakuta'
        });
        setThumbnailPreview('');
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

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(NEWS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newsFormData,
          admin_password: adminPassword
        }),
      });

      if (response.status === 403) {
        toast({
          title: 'Неверный пароль',
          description: 'Введите правильный пароль администратора',
          variant: 'destructive',
        });
        setIsPasswordDialogOpen(true);
      } else if (response.ok) {
        toast({
          title: 'Новость опубликована!',
          description: 'Ваша новость успешно добавлена',
        });
        setIsNewsDialogOpen(false);
        setIsAuthenticated(true);
        setNewsFormData({
          title: '',
          content: '',
          image_url: ''
        });
        setNewsImagePreview('');
        fetchNews();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось опубликовать новость',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNews = async (newsId: number, newsTitle: string) => {
    if (!confirm(`Удалить новость "${newsTitle}"?`)) return;

    try {
      const response = await fetch(`${NEWS_API_URL}?id=${newsId}&password=${encodeURIComponent(adminPassword)}`, {
        method: 'DELETE',
      });

      if (response.status === 403) {
        toast({
          title: 'Неверный пароль',
          description: 'Введите правильный пароль администратора',
          variant: 'destructive',
        });
        setIsPasswordDialogOpen(true);
      } else if (response.ok) {
        toast({
          title: 'Новость удалена',
          description: 'Новость успешно удалена',
        });
        fetchNews();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить новость',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0">
          {selectedVideo && (
            <div className="flex flex-col h-full">
              <div className="aspect-video w-full bg-black">
                {selectedVideo.video_url.includes('youtube.com') || selectedVideo.video_url.includes('youtu.be') ? (
                  <iframe
                    src={selectedVideo.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedVideo.video_url}
                    className="w-full h-full"
                    controls
                    autoPlay
                  />
                )}
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{selectedVideo.title}</h2>
                    {selectedVideo.episode_number && (
                      <p className="text-sm text-muted-foreground mt-1">Серия {selectedVideo.episode_number}</p>
                    )}
                  </div>
                  {selectedVideo.anime_series && (
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      {selectedVideo.anime_series === 'Gachiakuta' && '🔥 Гачиакута'}
                      {selectedVideo.anime_series === 'Windbreaker' && '💨 Ветролом'}
                      {selectedVideo.anime_series === 'Berserk' && '⚔️ Берсерк'}
                    </div>
                  )}
                </div>
                {selectedVideo.description && (
                  <p className="text-sm text-muted-foreground">{selectedVideo.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>🔒 Вход для администратора</DialogTitle>
            <DialogDescription>
              Введите пароль для загрузки видео и новостей
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin_password">Пароль администратора</Label>
              <Input
                id="admin_password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Введите пароль"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && adminPassword) {
                    setIsPasswordDialogOpen(false);
                    setIsAuthenticated(true);
                  }
                }}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                if (adminPassword) {
                  setIsPasswordDialogOpen(false);
                  setIsAuthenticated(true);
                } else {
                  toast({
                    title: 'Ошибка',
                    description: 'Введите пароль',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Войти
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div 
        className="relative h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://cdn.poehali.dev/files/fa99460f-b8c0-4838-b595-ac34ef41a777.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        
        <div className="relative z-10 text-center px-4 animate-fade-in">
          <div className="flex justify-center mb-6">
            <a href="#" className="hover:opacity-80 transition-opacity">
              <img 
                src="https://cdn.poehali.dev/files/3df2d6ee-0972-4457-8b17-abe5ce5858b2.jpg" 
                alt="BebraDub Logo" 
                className="w-64 h-64 object-cover rounded-2xl shadow-2xl border-4 border-primary/20 cursor-pointer"
              />
            </a>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            BebraDub
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Качественная русская озвучка любимых аниме
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="hover-scale">
              <Icon name="Play" className="mr-2" size={20} />
              Смотреть
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="hover-scale"
              asChild
            >
              <a href="https://t.me/bebradub" target="_blank" rel="noopener noreferrer">
                <Icon name="Send" className="mr-2" size={20} />
                Telegram
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="hover-scale"
              onClick={() => {
                if (!adminPassword) {
                  setIsPasswordDialogOpen(true);
                } else {
                  setIsDialogOpen(true);
                }
              }}
            >
              <Icon name="Upload" className="mr-2" size={20} />
              Загрузить видео
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Загрузить новую озвучку</DialogTitle>
                  <DialogDescription>
                    Загрузите видео с компьютера или добавьте ссылку
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="anime_series">Серия аниме *</Label>
                    <select
                      id="anime_series"
                      value={formData.anime_series}
                      onChange={(e) => setFormData({...formData, anime_series: e.target.value})}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
                      required
                    >
                      <option value="Gachiakuta">Гачиакута</option>
                      <option value="Windbreaker">Ветролом</option>
                      <option value="Berserk">Берсерк</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="title">Название серии *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Например: Начало пути"
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
                    <Label>Видео *</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="video_file"
                          accept="video/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsUploadingVideo(true);
                              try {
                                const url = await uploadFile(file);
                                setFormData({...formData, video_url: url});
                                toast({ 
                                  title: 'Видео загружено!', 
                                  description: 'Файл успешно загружен в облако' 
                                });
                              } catch (error) {
                                toast({ 
                                  title: 'Ошибка загрузки', 
                                  description: 'Не удалось загрузить видео',
                                  variant: 'destructive'
                                });
                              } finally {
                                setIsUploadingVideo(false);
                              }
                            }
                          }}
                          className="hidden"
                          disabled={isUploadingVideo}
                        />
                        <label htmlFor="video_file" className="w-full">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full" 
                            disabled={isUploadingVideo}
                            asChild
                          >
                            <span>
                              <Icon name={isUploadingVideo ? "Loader2" : "Upload"} className={`mr-2 ${isUploadingVideo ? 'animate-spin' : ''}`} size={16} />
                              {isUploadingVideo ? 'Загрузка...' : 'Загрузить файл'}
                            </span>
                          </Button>
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">или</span>
                        </div>
                      </div>
                      <Input
                        id="video_url"
                        value={formData.video_url}
                        onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                        placeholder="Вставьте ссылку на видео"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Обложка</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="thumbnail_file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                setThumbnailPreview(evt.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                              
                              setIsUploadingThumbnail(true);
                              try {
                                const url = await uploadFile(file);
                                setFormData({...formData, thumbnail_url: url});
                                toast({ 
                                  title: 'Обложка загружена!', 
                                  description: 'Изображение успешно загружено' 
                                });
                              } catch (error) {
                                toast({ 
                                  title: 'Ошибка загрузки', 
                                  description: 'Не удалось загрузить обложку',
                                  variant: 'destructive'
                                });
                              } finally {
                                setIsUploadingThumbnail(false);
                              }
                            }
                          }}
                          className="hidden"
                          disabled={isUploadingThumbnail}
                        />
                        <label htmlFor="thumbnail_file" className="w-full">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full" 
                            disabled={isUploadingThumbnail}
                            asChild
                          >
                            <span>
                              <Icon name={isUploadingThumbnail ? "Loader2" : "Image"} className={`mr-2 ${isUploadingThumbnail ? 'animate-spin' : ''}`} size={16} />
                              {isUploadingThumbnail ? 'Загрузка...' : 'Загрузить обложку'}
                            </span>
                          </Button>
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">или</span>
                        </div>
                      </div>
                      <Input
                        id="thumbnail"
                        value={formData.thumbnail_url}
                        onChange={(e) => {
                          setFormData({...formData, thumbnail_url: e.target.value});
                          if (e.target.value) {
                            setThumbnailPreview(e.target.value);
                          }
                        }}
                        placeholder="Вставьте ссылку на изображение"
                      />
                    </div>
                    {thumbnailPreview && (
                      <div className="mt-3">
                        <img 
                          src={thumbnailPreview} 
                          alt="Предпросмотр" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-border"
                        />
                      </div>
                    )}
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold mb-2">Наша озвучка</h2>
              <p className="text-muted-foreground">Последние добавленные серии</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={selectedSeries === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSeries('all')}
              >
                Все
              </Button>
              <Button 
                variant={selectedSeries === 'Gachiakuta' ? 'default' : 'outline'}
                onClick={() => setSelectedSeries('Gachiakuta')}
              >
                Гачиакута
              </Button>
              <Button 
                variant={selectedSeries === 'Windbreaker' ? 'default' : 'outline'}
                onClick={() => setSelectedSeries('Windbreaker')}
              >
                Ветролом
              </Button>
              <Button 
                variant={selectedSeries === 'Berserk' ? 'default' : 'outline'}
                onClick={() => setSelectedSeries('Berserk')}
              >
                Берсерк
              </Button>
            </div>
          </div>

          {videos.filter(v => selectedSeries === 'all' || v.anime_series === selectedSeries).length === 0 ? (
            <div className="text-center py-20">
              <Icon name="Video" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">Пока нет загруженных видео</p>
              <p className="text-sm text-muted-foreground mt-2">Нажмите "Загрузить видео" чтобы добавить первую озвучку</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.filter(v => selectedSeries === 'all' || v.anime_series === selectedSeries).map((video, index) => (
                <Card 
                  key={video.id} 
                  className="group overflow-hidden hover-scale cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => {
                    setSelectedVideo(video);
                    setIsPlayerOpen(true);
                  }}
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
                    {video.anime_series && (
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {video.anime_series === 'Gachiakuta' && '🔥 Гачиакута'}
                        {video.anime_series === 'Windbreaker' && '💨 Ветролом'}
                        {video.anime_series === 'Berserk' && '⚔️ Берсерк'}
                      </div>
                    )}
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
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVideo(video);
                        setIsPlayerOpen(true);
                      }}
                    >
                      <Icon name="Play" className="mr-2" size={16} />
                      Смотреть
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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2">Новости</h2>
              <p className="text-muted-foreground">Последние обновления и анонсы</p>
            </div>
            <Button 
              className="hover-scale"
              onClick={() => {
                if (!adminPassword) {
                  setIsPasswordDialogOpen(true);
                } else {
                  setIsNewsDialogOpen(true);
                }
              }}
            >
              <Icon name="Plus" className="mr-2" size={20} />
              Добавить новость
            </Button>
            
            <Dialog open={isNewsDialogOpen} onOpenChange={setIsNewsDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Опубликовать новость</DialogTitle>
                  <DialogDescription>
                    Добавьте новость или анонс для ваших подписчиков
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleNewsSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="news_title">Заголовок *</Label>
                    <Input
                      id="news_title"
                      value={newsFormData.title}
                      onChange={(e) => setNewsFormData({...newsFormData, title: e.target.value})}
                      placeholder="Например: Новый сезон Гачиакута"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="news_content">Текст новости *</Label>
                    <Textarea
                      id="news_content"
                      value={newsFormData.content}
                      onChange={(e) => setNewsFormData({...newsFormData, content: e.target.value})}
                      placeholder="Расскажите о новости подробнее..."
                      rows={6}
                      required
                    />
                  </div>
                  <div>
                    <Label>Обложка новости</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="news_image_file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                setNewsImagePreview(evt.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                              
                              setIsUploadingNewsImage(true);
                              try {
                                const url = await uploadFile(file);
                                setNewsFormData({...newsFormData, image_url: url});
                                toast({ 
                                  title: 'Изображение загружено!', 
                                  description: 'Файл успешно загружен' 
                                });
                              } catch (error) {
                                toast({ 
                                  title: 'Ошибка загрузки', 
                                  description: 'Не удалось загрузить изображение',
                                  variant: 'destructive'
                                });
                              } finally {
                                setIsUploadingNewsImage(false);
                              }
                            }
                          }}
                          className="hidden"
                          disabled={isUploadingNewsImage}
                        />
                        <label htmlFor="news_image_file" className="w-full">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full" 
                            disabled={isUploadingNewsImage}
                            asChild
                          >
                            <span>
                              <Icon name={isUploadingNewsImage ? "Loader2" : "Image"} className={`mr-2 ${isUploadingNewsImage ? 'animate-spin' : ''}`} size={16} />
                              {isUploadingNewsImage ? 'Загрузка...' : 'Загрузить изображение'}
                            </span>
                          </Button>
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">или</span>
                        </div>
                      </div>
                      <Input
                        id="news_image"
                        value={newsFormData.image_url}
                        onChange={(e) => {
                          setNewsFormData({...newsFormData, image_url: e.target.value});
                          if (e.target.value) {
                            setNewsImagePreview(e.target.value);
                          }
                        }}
                        placeholder="Вставьте ссылку на изображение"
                      />
                    </div>
                    {newsImagePreview && (
                      <div className="mt-3">
                        <img 
                          src={newsImagePreview} 
                          alt="Предпросмотр" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-border"
                        />
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Публикация...' : 'Опубликовать'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-20">
              <Icon name="Newspaper" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">Пока нет новостей</p>
              <p className="text-sm text-muted-foreground mt-2">Нажмите "Добавить новость" чтобы опубликовать первую новость</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((article, index) => (
                <Card 
                  key={article.id} 
                  className="overflow-hidden hover-scale animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {article.image_url && (
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(article.created_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{article.content}</p>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleDeleteNews(article.id, article.title)}
                    >
                      <Icon name="Trash2" className="mr-2" size={16} />
                      Удалить новость
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4">
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
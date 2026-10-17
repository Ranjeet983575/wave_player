import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library/legacy';

import { readStored, storageKeys } from '@/services/storage';
import type { LocalVideo } from '@/types/media';

export async function requestVideoPermission() {
  return MediaLibrary.requestPermissionsAsync(false, ['video']);
}

export async function getDeviceVideos(albumId?: string): Promise<LocalVideo[]> {
  const result = await MediaLibrary.getAssetsAsync({
    mediaType: MediaLibrary.MediaType.video,
    ...(albumId ? { album: albumId } : {}),
    first: 100,
    sortBy: [MediaLibrary.SortBy.creationTime],
  });

  return result.assets.map((asset) => ({
    id: asset.id,
    uri: asset.uri,
    title: asset.filename,
    duration: asset.duration,
    width: asset.width,
    height: asset.height,
    creationTime: asset.creationTime,
    albumId: asset.albumId,
  }));
}

export async function getVideoAlbums() {
  return MediaLibrary.getAlbumsAsync({ includeSmartAlbums: false });
}

export async function getImportedVideos(): Promise<LocalVideo[]> {
  return readStored<LocalVideo[]>(storageKeys.imports, []);
}

export async function importVideoFile(): Promise<LocalVideo | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'video/*',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;

  const picked = result.assets[0];
  const safeName = picked.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destination = new File(Paths.document, `${Date.now()}-${safeName}`);
  new File(picked.uri).copy(destination);

  return {
    id: `import:${destination.uri}`,
    uri: destination.uri,
    title: picked.name,
    duration: 0,
    isImported: true,
  };
}

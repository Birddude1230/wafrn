import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProcessedPost } from '../interfaces/processed-post';
import { RawPost } from '../interfaces/raw-post';
import { MediaService } from './media.service';
import * as DOMPurify from 'dompurify';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PostsService {


  wafrnMediaRegex = /\[wafrnmediaid="[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}"\]/gm;
  uuidRegex = /[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/;
  youtubeLinkRegex = /(?:https?:\/\/)?(?:www\.|m\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/gm;
  youtubeRegex = /(?:https?:)?(?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube(?:\-nocookie)?\.(?:[A-Za-z]{2,4}|[A-Za-z]{2,3}\.[A-Za-z]{2})\/)(?:watch|embed\/|vi?\/)*(?:\?[\w=&]*vi?=)?([^#&\?\/]{11}).*?/;
  public updateFollowers: BehaviorSubject<Boolean> = new BehaviorSubject(new Boolean());

  public followedUserIds: Array<String> = [];
  constructor(
    private mediaService: MediaService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
    this.loadFollowers();
  }


  async loadFollowers() {
    let followedUsers = await this.http.get<Array<String>>(environment.baseUrl + '/getFollowedUsers').toPromise()
    if (followedUsers) {
      this.followedUserIds = followedUsers;
      this.updateFollowers.next(true);
    }
  }

  async followUser(id: string): Promise<boolean> {
    let res = false;
    let payload = new FormData();
    payload.append('userId', id);
    try {
      let response = await this.http.post<{ success: boolean }>(environment.baseUrl + '/follow', payload).toPromise();
      await this.loadFollowers();
      res = response?.success === true;
    } catch (exception) {
      console.log(exception)
    }

    return res;
  }

  async unfollowUser(id: string): Promise<boolean> {
    let res = false;
    let payload = new FormData();
    payload.append('userId', id);
    try {
      let response = await this.http.post<{ success: boolean }>(environment.baseUrl + '/unfollow', payload).toPromise();
      await this.loadFollowers();
      res = response?.success === true;
    } catch (exception) {
      console.log(exception)
    }

    return res;
  }

  async getDetails(id: string): Promise<number> {
    let res = 0;
    let payload = new FormData();
    payload.append('id', id);
    try {
      let response = await this.http.post<{ reblogs: number }>(environment.baseUrl + '/postDetails', payload).toPromise();
      if(response?.reblogs) {
        res = response.reblogs;
      }
    } catch (exception) {
      console.log(exception)
    }

    return res;
  }

  processPost(rawPost: RawPost): ProcessedPost[] {
    let result: ProcessedPost[] = [];
    if (rawPost.ancestors) {
      rawPost.ancestors.forEach((post: RawPost) => {
        result.push(post);
      });
      result = result.sort((a, b) => new Date(a.createdAt).getTime() - new Date (b.createdAt).getTime());
      result.push(rawPost);
    }
    result.forEach(val => {
      this.mediaService.addMediaToMap(val);
    });
    return result;
  }


  getPostHtml(content: string): string {

    const replacements: Array<{ wafrnMediaStringToReplace: string, id: string }> = [];

    let sanitized = DOMPurify.sanitize(content, { ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'span', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'strong', 'em']});
    // we remove stuff like img and script tags. we only allow certain stuff.
    const youtubeLinks = sanitized.match(this.youtubeLinkRegex);

    if (youtubeLinks) {
      youtubeLinks.forEach(youtubeString => {
        // some exception, like when its on a href or stuff
        if (youtubeString.indexOf('"') === -1) {
          let ids = youtubeString.match(this.youtubeRegex);
          if (ids) {
            const videoId = ids[1];
            const newString = '<app-wafrn-youtube-player video="' + videoId + '"></app-wafrn-youtube-player>';
            sanitized = sanitized.replace(youtubeString, newString);
          }
        }
      })
    }



    sanitized.match(this.wafrnMediaRegex)?.forEach((media) => {
      let id = '0';
      const uuid = media.match(this.uuidRegex);
      if (uuid) {
        id = uuid[0]
      }
      replacements.push({ wafrnMediaStringToReplace: media, id: id });
    });

    replacements.forEach(replacement => {
      const replacementString = '<app-wafrn-media id="' + replacement.id + '" > </app-wafrn-media>'
      sanitized = sanitized.replace(replacement.wafrnMediaStringToReplace, replacementString);

    })


    return sanitized;

  }
}

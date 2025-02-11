import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProcessedPost } from 'src/app/interfaces/processed-post';
import { DashboardService } from 'src/app/services/dashboard.service';
import { PostsService } from 'src/app/services/posts.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-post',
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.scss']
})
export class ViewPostComponent implements OnInit {


  post: ProcessedPost[] = [];
  loading = true;
  blogUrl: string = '';
  blogDetails: any;
  mediaUrl = environment.baseMediaUrl;


  constructor(
    private activatedRoute: ActivatedRoute,
    private dashboardService: DashboardService
  ) { }

  async ngOnInit(): Promise<void> {
    let postId = this.activatedRoute.snapshot.paramMap.get('id');
    if(postId) {
      this.post = await this.dashboardService.getPost(postId);
      this.blogDetails = await this.dashboardService.getBlogDetails(this.post[this.post.length -1].user.url)
      this.loading = false;
    }
  }

}

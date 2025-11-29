package com.pranav_khode.InterviewAce.history;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.client.gridfs.model.GridFSFile;

@Service
public class VideoStorageService {

    private final GridFsTemplate gridFsTemplate;

    @Autowired
    public VideoStorageService(GridFsTemplate gridFsTemplate) {
        this.gridFsTemplate = gridFsTemplate;
    }

    public String saveVideo(MultipartFile video) throws IOException {
        return gridFsTemplate
                .store(video.getInputStream(), video.getOriginalFilename(), "video/mp4")
                .toString();
    }

    public GridFsResource getVideo(String id) {
        GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(id)));
        return gridFsTemplate.getResource(file);
    }
}


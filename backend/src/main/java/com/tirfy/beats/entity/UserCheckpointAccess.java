package com.tirfy.beats.entity;


import jakarta.persistence.*;

@Entity
@Table(
        name = "user_checkpoint_access",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_user_checkpoint_access",
                        columnNames = {"user_id", "checkpoint_id"}
                )
        }
)
public class UserCheckpointAccess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "checkpoint_id", nullable = false)
    private Checkpoint checkpoint;

    public UserCheckpointAccess() {
    }

    public UserCheckpointAccess(
            Long id,
            User user,
            Checkpoint checkpoint) {

        this.id = id;
        this.user = user;
        this.checkpoint = checkpoint;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Checkpoint getCheckpoint() {
        return checkpoint;
    }

    public void setCheckpoint(Checkpoint checkpoint) {
        this.checkpoint = checkpoint;
    }
}
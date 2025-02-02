from collections import deque

def schedule_ads():
    # Ads and their required play counts
    ads = {
        "Ad1": 60,
        "Ad2": 6,
        "Ad3": 2,
        "Ad4": 3
    }
    
    # Total plays required
    total_plays = sum(ads.values())
    
    # Compute relative weights (how often each ad should appear)
    schedule = []
    
    # Create a queue of ads based on their frequency
    ad_queue = deque(sorted(ads.items(), key=lambda x: -x[1]))
    
    while sum(ads.values()) > 0:
        for ad, count in list(ad_queue):
            if ads[ad] > 0:
                schedule.append(ad)
                ads[ad] -= 1
            
            # Rotate the queue to avoid repeating the same ad consecutively
            ad_queue.rotate(-1)
    
    return schedule

# Generate the ad schedule
ad_schedule = schedule_ads()

# Print the first few scheduled ads to verify distribution
for i in range(0, len(ad_schedule), 4):
    print(" ".join(ad_schedule[i:i+4]))


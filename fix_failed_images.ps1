# Fix the 21 failed product images with alternative Unsplash photo IDs
$assetsDir = "d:\WebSite-Pro\client\public\assets"

$products = [ordered]@{
    # Electronics fixes
    "product-quantum-headphones.png" = "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop"
    "product-solar-watch.png"        = "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&h=800&fit=crop"
    "product-desk-lamp.png"          = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop"
    "product-noise-machine.png"      = "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&h=800&fit=crop"
    "product-smart-plug.png"         = "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&h=800&fit=crop"
    "product-webcam.png"             = "https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=800&h=800&fit=crop"
    "product-turntable.png"          = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop"

    # Clothing fixes
    "product-hoodie.png"             = "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&h=800&fit=crop"
    "product-joggers.png"            = "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=800&fit=crop"
    "product-beanie.png"             = "https://images.unsplash.com/photo-1510598155485-1c3e5d7ba1ed?w=800&h=800&fit=crop"
    "product-bucket-hat.png"         = "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&h=800&fit=crop"

    # Footwear fixes
    "product-hiking-boots.png"       = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&sat=-30"
    "product-work-boots.png"         = "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=800&fit=crop"
    "product-basketball-highs.png"   = "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=800&fit=crop"
    "product-canvas-sneakers.png"    = "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&h=800&fit=crop"
    "product-brogue-shoes.png"       = "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&h=800&fit=crop"
    "product-leather-derby.png"      = "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop"
    "product-puffer-boots.png"       = "https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=800&h=800&fit=crop"
    "product-barefoot-sneaker.png"   = "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&h=800&fit=crop"
    "product-platform-sneakers.png"  = "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&h=800&fit=crop"
    "product-cycling-shoes.png"      = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop"
}

$total = $products.Count
$count = 0
$failed = @()

foreach ($entry in $products.GetEnumerator()) {
    $count++
    $filename = $entry.Key
    $url = $entry.Value
    $filepath = Join-Path $assetsDir $filename

    try {
        Write-Host "[$count/$total] $filename" -ForegroundColor Cyan
        Invoke-WebRequest -Uri $url -OutFile $filepath -TimeoutSec 30 -ErrorAction Stop | Out-Null
        $fileSize = (Get-Item $filepath).Length
        if ($fileSize -gt 10000) {
            Write-Host "  OK ($([math]::Round($fileSize/1024))KB)" -ForegroundColor Green
        } else {
            Write-Host "  Warning: tiny file" -ForegroundColor Yellow
            $failed += $filename
        }
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $failed += $filename
    }
    Start-Sleep -Milliseconds 150
}

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Fixed: $($total - $failed.Count)/$total"
if ($failed.Count -gt 0) {
    Write-Host "Still failed:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  - $_" }
}

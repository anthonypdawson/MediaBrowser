﻿using MediaBrowser.Controller.Configuration;
using MediaBrowser.Controller.Entities;
using MediaBrowser.Controller.Entities.Audio;
using MediaBrowser.Controller.Library;
using MediaBrowser.Providers.Music;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;

namespace MediaBrowser.Providers.Savers
{
    class ArtistXmlSaver : IMetadataSaver
    {
        private readonly IServerConfigurationManager _config;

        public ArtistXmlSaver(IServerConfigurationManager config)
        {
            _config = config;
        }

        /// <summary>
        /// Determines whether [is enabled for] [the specified item].
        /// </summary>
        /// <param name="item">The item.</param>
        /// <param name="updateType">Type of the update.</param>
        /// <returns><c>true</c> if [is enabled for] [the specified item]; otherwise, <c>false</c>.</returns>
        public bool IsEnabledFor(BaseItem item, ItemUpdateType updateType)
        {
            var wasMetadataEdited = (updateType & ItemUpdateType.MetadataEdit) == ItemUpdateType.MetadataEdit;
            var wasMetadataDownloaded = (updateType & ItemUpdateType.MetadataDownload) == ItemUpdateType.MetadataDownload;

            // If new metadata has been downloaded and save local is on
            if (_config.Configuration.SaveLocalMeta && (wasMetadataEdited || wasMetadataDownloaded))
            {
                if (item is MusicArtist)
                {
                    return true;
                }
            }

            // If new metadata has been downloaded or metadata was manually edited, proceed
            if (wasMetadataDownloaded || wasMetadataEdited)
            {
                var artist = item as MusicArtist;
                if (artist != null && artist.IsAccessedByName)
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Saves the specified item.
        /// </summary>
        /// <param name="item">The item.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns>Task.</returns>
        public void Save(BaseItem item, CancellationToken cancellationToken)
        {
            var builder = new StringBuilder();

            builder.Append("<Item>");

            XmlSaverHelpers.AddCommonNodes(item, builder);

            builder.Append("</Item>");

            var xmlFilePath = GetSavePath(item);

            XmlSaverHelpers.Save(builder, xmlFilePath, new List<string> { });
        }

        /// <summary>
        /// Gets the save path.
        /// </summary>
        /// <param name="item">The item.</param>
        /// <returns>System.String.</returns>
        public string GetSavePath(BaseItem item)
        {
            return Path.Combine(item.Path, "artist.xml");
        }
    }
}

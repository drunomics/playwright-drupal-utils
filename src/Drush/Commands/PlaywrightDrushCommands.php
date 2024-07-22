<?php

namespace playwright_drupal_utils\Drush\Commands;

use drunomics\ServiceUtils\Core\Database\DatabaseConnectionTrait;
use drunomics\ServiceUtils\Core\Entity\EntityTypeManagerTrait;
use drunomics\ServiceUtils\Core\Path\AliasManagerTrait;
use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Entity\TranslatableInterface;
use Drupal\Core\Logger\RfcLogLevel;
use Drupal\node\NodeInterface;
use Drush\Commands\DrushCommands;

/**
 * Defines command for dealing with playwright testing requirements.
 */
class PlaywrightDrushCommands extends DrushCommands {
  use EntityTypeManagerTrait;
  use AliasManagerTrait;
  use DatabaseConnectionTrait;

  /**
   * Clone a node with given title.
   *
   * @param string $node_type
   *   Type of the node to clone.
   * @param string $node_title
   *   The title of node to be cloned.
   * @param string $new_node_title
   *   Title of the clone.
   * @param string $moderation_state
   *   (Optional) moderation state of the clone.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-clone
   * @aliases nc
   */
  public function cloneNodeByTitle($node_type, $node_title, $new_node_title, $moderation_state = 'published') {
    $storage = $this->getEntityTypeManager()->getStorage('node');
    $nodes = $storage->loadByProperties([
      'title' => $node_title,
      'type' => $node_type,
    ]);
    if (!$node = reset($nodes)) {
      throw new \RuntimeException('Unable to load node.');
    }
    $clone = $node->createDuplicate();
    $clone->title = $new_node_title;
    if ($moderation_state && $clone->hasField('moderation_state')) {
      $clone->set('moderation_state', $moderation_state);
    }
    $clone->save();
  }

  /**
   * Change primary topic of node.
   *
   * @param string $title
   *   Title of the node.
   * @param string $name
   *   Primary topic to set.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-set-primary-topic
   * @aliases nspt
   */
  public function changeNodePrimaryTopic($title, $name) {
    $entityTypeManager = $this->getEntityTypeManager();
    $nodes = $entityTypeManager
      ->getStorage('node')
      ->loadByProperties([
        'title' => $title,
      ]);
    if ($node = reset($nodes)) {
      $terms = $entityTypeManager
        ->getStorage('taxonomy_term')
        ->loadByProperties([
          'vid' => 'topics',
          'name' => $name,
        ]);
      if ($term = reset($terms)) {
        $node->field_topic->target_id = $term->id();
        pathauto_entity_delete($node);
        $node->save();
      }
      else {
        throw new \Exception('Unable to load term.');
      }
    }
    else {
      throw new \Exception('Unable to load node.');
    }
    return 'Primary topic of node "' . $title . '" changed to "' . $name . '"';
  }

  /**
   * Change channel of node.
   *
   * @param string $title
   *   Title of the node.
   * @param string $name
   *   Primary topic to set.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-set-channel
   * @aliases nsc
   */
  public function changeNodeChannel($title, $name) {
    $entityTypeManager = $this->getEntityTypeManager();
    $nodes = $entityTypeManager
      ->getStorage('node')
      ->loadByProperties([
        'title' => $title,
      ]);
    if ($node = reset($nodes)) {
      $terms = $entityTypeManager
        ->getStorage('taxonomy_term')
        ->loadByProperties([
          'vid' => 'channel',
          'name' => $name,
        ]);
      if ($term = reset($terms)) {
        $node->field_channel->target_id = $term->id();
        pathauto_entity_delete($node);
        $node->save();
      }
      else {
        throw new \Exception('Unable to load term.');
      }
    }
    else {
      throw new \Exception('Unable to load node.');
    }
    return 'Channel of node "' . $title . '" changed to "' . $name . '"';
  }

  /**
   * Gets id of node with given title.
   *
   * @param string $title
   *   Title of the node.
   *
   * @return string
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-get-id
   * @aliases ngid
   */
  public function getNodeIdWithTitle(string $title): string {
    $nodes = $this->getEntityTypeManager()->getStorage('node')->loadByProperties([
      'title' => $title,
    ]);
    foreach ($nodes as $node) {
      if ($node instanceof NodeInterface) {
        if ($node->getTitle() === $title) {
          return $node->id();
        }
      }
    }
    throw new \Exception("Could not find node with title '{$title}'");
  }

  /**
   * Gets id of entity.
   *
   * @param string $entity_type
   *   The entity type.
   * @param string $entity_spec
   *   An identifier for the entity: either its label, or property/field-value
   *   pairs represented as a JSON object (optionally base64-encoded). These
   *   must resolve to a single entity.
   *
   * @return string
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:entity-get-id
   * @aliases ngid
   */
  public function getEntityIdByLabel(string $entity_type, string $entity_spec): string {
    $storage = $this->getEntityTypeManager()->getStorage($entity_type);
    $query_contidions = $this->decodeJsonObject($entity_spec)
          ?? [$storage->getEntityType()->getKey('label') => $entity_spec];
    $query = $storage
      ->getQuery()
      ->accessCheck(FALSE);
    foreach ($query_contidions as $property => $value) {
      $query->condition($property, $value);
    }
    $entity_ids = $query->execute();
    if (!$entity_ids) {
      throw new \Exception("Could not find {$entity_type} matching " . json_encode($query_contidions) . '.');
    }
    if (count($entity_ids) > 1) {
      throw new \Exception('Found ' . count($entity_ids) . " {$entity_type} entities matching " . json_encode($query_contidions) . '.');
    }
    return current($entity_ids);
  }

  /**
   * Gets path of node with given title.
   *
   * @param string $title
   *   Title of the node.
   *
   * @return string
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-get-path
   * @aliases ngpath
   */
  public function getNodePathWithTitle(string $title): string {
    $nodes = $this->getEntityTypeManager()->getStorage('node')->loadByProperties([
      'title' => $title,
    ]);
    if ($node = reset($nodes)) {
      return parse_url($node->toUrl()->toString(), PHP_URL_PATH);
    }
    throw new \Exception("Could not find node with title '{$title}'");
  }

  /**
   * Gets path alias of node with given title.
   *
   * @param string $title
   *   Title of the node.
   * @param string $langcode
   *   (Optional) language code to look up the path in.
   *
   * @return string
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   *
   * @bootstrap full
   * @command test:node-get-path-alias
   * @aliases ngpath-alias
   */
  public function getNodePathAliasWithTitle(string $title, $langcode = ''): string {
    $nodes = $this->getEntityTypeManager()->getStorage('node')->loadByProperties([
      'title' => $title,
    ]);
    if ($node = reset($nodes)) {
      if ($langcode) {
        return $this->getAliasManager()->getAliasByPath('/node/' . $node->id(), $langcode);
      }
      // Just a precaution in case getAliasByPath() changes its signature: do
      // not pass langcode in the default case.
      return $this->getAliasManager()->getAliasByPath('/node/' . $node->id());
    }
    throw new \Exception("Could not find node with title '{$title}'");
  }

  /**
   * Gets canonical url.
   *
   * @return string
   *
   * @throws \Exception
   *
   * @bootstrap full
   * @command test:get-canonical-url
   * @aliases gcanonical
   */
  public function getCanonicalUrl(): string {
    if ($site_url = \Drupal::service('ldp_ce_api.ldp_base_url_provider')->getFrontendBaseUrl()) {
      return $site_url . '/';
    }
    throw new \Exception('Could not load canonical url');
  }

  /**
   * Add a translation to a content entity.
   *
   * If a translation already exists: do nothing - and exit without error, so
   * the command can run repeatedly. (If a test fails because of missing
   * certain translated text, it's likely that the test should be changed to
   * take the already-present translated content into account.)
   *
   * @param string $entity_type
   *   The entity type.
   * @param string $entity_spec
   *   An identifier for the entity: either its label, or property/field-value
   *   pairs represented as a JSON object (optionally base64-encoded). These
   *   must resolve to a single entity.
   * @param string $langcode
   *   Language code to translate specified fields into.
   * @param string $translation
   *   Fields with translated string values, represented as a JSON object
   *   (optionally base64-encoded).
   *
   * @bootstrap full
   * @command test:entity-add-translation
   */
  public function translateEntity($entity_type, $entity_spec, $langcode, $translation) {
    $translation = $this->decodeJsonObject($translation);
    if (!$translation) {
      throw new \Exception("'translation' argument is not a JSON object.");
    }

    $storage = $this->getEntityTypeManager()->getStorage($entity_type);
    $load_by_properties = $this->decodeJsonObject($entity_spec)
      ?? [$storage->getEntityType()->getKey('label') => $entity_spec];
    $entities = $storage->loadByProperties($load_by_properties);
    if (!$entities) {
      throw new \Exception("Could not find {$entity_type} matching " . json_encode($load_by_properties) . '.');
    }
    if (count($entities) > 1) {
      throw new \Exception('Found ' . count($entities) . " {$entity_type} entities matching " . json_encode($load_by_properties) . '.');
    }
    $original_entity = current($entities);
    if (!$original_entity instanceof TranslatableInterface) {
      throw new \Exception("{$entity_type} matching " . json_encode($load_by_properties) . ' is not translatable.');
    }

    $current_languges = $original_entity->getTranslationLanguages();
    if (isset($current_languges[$langcode])) {
      // Do not touch any translated data that is already present. Exit without
      // error, so repeated tests run OK.
      $this->logger()
        ->notice(dt('@type matching @spec already has a translation; exiting.', [
          '@type' => $entity_type,
          '@spec' => json_encode($load_by_properties),
        ]));
    }
    else {
      $translated_entity = $original_entity->addTranslation($langcode, $translation + $original_entity->toArray());
      $translated_entity->save();
    }
  }

  /**
   * Clean-up content we created.
   *
   * @param string $keyword
   *   Title of the node.
   *
   * @bootstrap full
   * @command test:testsCleanUp
   * @aliases testcu
   */
  public function cleanUpContent(string $keyword) {
    $node_storage = $this->getEntityTypeManager()->getStorage('node');
    $nids = $node_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('title', $keyword, 'STARTS_WITH')
      ->execute();
    if (!empty($nids)) {
      $nodes = $node_storage->loadMultiple($nids);
      if (!empty($nodes)) {
        if (\Drupal::hasService('content_lock')) {
          // Never keep content with the specified keyword, regardless of lock
          // status.
          /** @var \Drupal\content_lock\ContentLock\ContentLock $lock_service */
          $lock_service = \Drupal::service('content_lock');
          foreach ($nodes as $node) {
            if ($lock_service->isLockable($node)) {
              $langcode = $node->language()->getId();
              $data = $lock_service->fetchLock($node->id(), NULL, $langcode, 'node');
              if ($data !== FALSE) {
                $lock_service->release($node->id(), $langcode, '*');
              }
            }
          }
        }

        $node_storage->delete($nodes);
      }
    }
    $taxonomy_term_storage = $this->getEntityTypeManager()->getStorage('taxonomy_term');
    $tids = $taxonomy_term_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('name', $keyword, 'STARTS_WITH')
      ->execute();
    if (!empty($tids)) {
      $terms = $taxonomy_term_storage->loadMultiple($tids);
      if (!empty($terms)) {
        $taxonomy_term_storage->delete($terms);
      }
    }
    $media_storage = $this->getEntityTypeManager()->getStorage('media');
    $mids = $media_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('name', $keyword, 'STARTS_WITH')
      ->execute();
    if (!empty($mids)) {
      $media = $media_storage->loadMultiple($mids);
      if (!empty($media)) {
        $media_storage->delete($media);
      }
    }
  }

  /**
   * Clean-up translations.
   *
   * @param string $keyword
   *   Title of the translated node.
   * @param string $langcode
   *   Language code of the translation.
   *
   * @bootstrap full
   * @command test:translationCleanUp
   */
  public function cleanUpTranslation(string $keyword, string $langcode): void {
    $node_storage = $this->getEntityTypeManager()->getStorage('node');
    $nids = $node_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('title', $keyword, 'STARTS_WITH')
      ->condition('langcode', $langcode)
      ->execute();
    if (!empty($nids)) {
      $nodes = $node_storage->loadMultiple($nids);
      if (!empty($nodes)) {
        foreach ($nodes as $node) {
          if ($node->hasTranslation($langcode)) {
            $node->removeTranslation($langcode);
            $node->save();
          }
        }
      }
    }

    $taxonomy_term_storage = $this->getEntityTypeManager()->getStorage('taxonomy_term');
    $tids = $taxonomy_term_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('name', $keyword, 'STARTS_WITH')
      ->condition('langcode', $langcode)
      ->execute();
    if (!empty($tids)) {
      $terms = $taxonomy_term_storage->loadMultiple($tids);
      if (!empty($terms)) {
        foreach ($terms as $term) {
          if ($term->hasTranslation($langcode)) {
            $term->removeTranslation($langcode);
            $term->save();
          }
        }
      }
    }
  }

  /**
   * Gets cors config.
   *
   *   Useful for checking if cors is properly configured.
   *
   * @bootstrap full
   * @command test:get-cors
   * @aliases gcors
   */
  public function getCorsParams() {
    return json_encode(\Drupal::getContainer()->getParameter('cors.config'), JSON_PRETTY_PRINT);
  }

  /**
   * Check if there are errors in watchdog.
   *
   * @param int $timestamp
   *   Timestamp from when to look for errors.
   * @param bool $fail_on_notice
   *   Variable to change severity level of which watchdog errors to load.
   * @param bool $verbose
   *   Print error messages as well.
   *
   * @bootstrap full
   * @command test:checkWatchdog
   * @aliases testcw
   */
  public function checkForWatchdogErrors(int $timestamp, bool $fail_on_notice = FALSE, bool $verbose = FALSE) : string {
    $severity_level = $fail_on_notice ? RfcLogLevel::NOTICE : RfcLogLevel::WARNING;
    // Check if microtime was used as parameter and convert to unix timestamp.
    if ($timestamp > 10 ** 13) {
      $timestamp /= 1000;
    }
    $query = $this->getDatabaseConnection()->select('watchdog', 'w');
    $query->fields("w");
    $query->condition('timestamp', $timestamp, '>');
    $query->condition('severity', $severity_level, '<=');
    $query->condition('type', 'php');
    $query->orderBy('timestamp', 'DESC');
    $log_entries = $query->execute()->fetchAllAssoc('wid');
    $result = [
      'numberOfErrors' => 0,
      'errors' => [],
    ];
    if ($log_entries && is_array($log_entries)) {
      foreach ($log_entries as $entry) {
        // @see \Drupal\dblog\Controller\DbLogController::formatMessage()
        $variables = (array) @unserialize($entry->variables, ['allowed_classes' => FALSE]);
        if ($verbose) {
          $message = (new FormattableMarkup($entry->message, $variables));
          $result['errors'][] = [
            'message' => $message ?? '',
            'wid' => $entry->wid ?? '',
            'type' => $entry->type ?? '',
            'severity' => RfcLogLevel::getLevels()[$entry->severity] ?? '',
          ];
        }
        $result['numberOfErrors'] += 1;
      }
    }
    return json_encode($result, JSON_PRETTY_PRINT);
  }

  /**
   * Decodes a JSON object which is optionally base64-encoded.
   *
   * Base64-encoding is supported for callers that have issues passing quotes.
   *
   * @param string $properties
   *   The string to decode.
   *
   * @return ?array
   *   A decoded array or NULL if not valid JSON.
   *
   * @throws \Exception
   *   If the decoded value is valid but not an array.
   */
  private function decodeJsonObject(string $properties) {
    $decoded = json_decode($properties, TRUE);
    if (!is_array($decoded) || !$decoded) {
      $decoded = json_decode(base64_decode($properties) ?: '', TRUE);
    }
    if (isset($decoded) && !is_array($decoded)) {
      throw new \Exception("Invalid (base64) JSON: '$properties'");
    }

    return $decoded;
  }

}
